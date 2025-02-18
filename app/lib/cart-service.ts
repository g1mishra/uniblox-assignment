import { supabase } from "../../lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface DiscountConfig {
  nthOrder: number;
  percentage: number;
}

interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  used_discount_code: string | null;
  created_at: string;
}

class CartService {
  private static instance: CartService;
  private orderCount: Record<string, number> = {};
  private discountCodes: Map<string, Set<string>> = new Map();
  private usedDiscountCodes: Map<string, Set<string>> = new Map();
  private config: DiscountConfig = {
    nthOrder: 3,
    percentage: 10,
  };
  private totalRevenue: number = 0;
  private totalDiscount: number = 0;
  private totalItems: number = 0;

  private constructor() {
    this.initializeFromOrders();
  }

  private async initializeFromOrders() {
    const orders = await this.loadOrders();
    this.orderCount = {};

    orders.forEach((order) => {
      if (order.user_id) {
        this.orderCount[order.user_id] = (this.orderCount[order.user_id] || 0) + 1;
        this.initializeUserData(order.user_id);
      }
    });
  }

  static getInstance() {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  getConfig() {
    return this.config;
  }

  updateConfig(config: Partial<DiscountConfig>) {
    this.config = { ...this.config, ...config };
    return this.config;
  }

  private generateUniqueCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `USER${userId.substring(0, 4)}${timestamp}${random}`.toUpperCase();
  }

  private initializeUserData(userId: string) {
    if (!this.orderCount[userId]) {
      this.orderCount[userId] = 0;
    }
    if (!this.discountCodes.has(userId)) {
      this.discountCodes.set(userId, new Set());
    }
    if (!this.usedDiscountCodes.has(userId)) {
      this.usedDiscountCodes.set(userId, new Set());
    }
  }

  private generateDiscountCode(userId: string) {
    const newCode = this.generateUniqueCode(userId);
    this.discountCodes.get(userId)?.add(newCode);
  }

  getAvailableDiscountCode(userId: string) {
    this.initializeUserData(userId);
    return Array.from(this.discountCodes.get(userId) || [])[0] || null;
  }

  validateDiscountCode(userId: string, code: string): { valid: boolean; error?: string } {
    this.initializeUserData(userId);
    if (!this.discountCodes.get(userId)?.has(code)) {
      return { valid: false, error: "Invalid discount code" };
    }
    if (this.usedDiscountCodes.get(userId)?.has(code)) {
      return { valid: false, error: "This discount code has already been used" };
    }
    return { valid: true };
  }

  private async loadOrders() {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      return [];
    }
    return orders || [];
  }

  private async saveOrder(order: {
    userId: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    discountCode?: string;
  }): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: order.userId,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          used_discount_code: order.discount > 0 ? order.discountCode : null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save order: ${error.message}`);
    }
    return data as Order;
  }

  async loadProducts(): Promise<Product[]> {
    const { data: products, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error loading products:", error);
      return [];
    }
    return products;
  }

  async checkout(userId: string, items: CartItem[], discountCode?: string) {
    this.initializeUserData(userId);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    let discount = 0;

    if (discountCode) {
      const validation = this.validateDiscountCode(userId, discountCode);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      discount = (subtotal * this.config.percentage) / 100;
      this.discountCodes.get(userId)?.delete(discountCode);
      this.usedDiscountCodes.get(userId)?.add(discountCode);
      this.totalDiscount += discount;
    }

    this.orderCount[userId]++;
    this.totalRevenue += subtotal - discount;
    this.totalItems += items.reduce((sum, item) => sum + item.quantity, 0);

    if (this.orderCount[userId] % this.config.nthOrder === 0) {
      this.generateDiscountCode(userId);
    }

    const order = {
      userId,
      items,
      subtotal,
      discount,
      total: subtotal - discount,
    };

    const savedOrder = await this.saveOrder(order);

    return {
      ...savedOrder,
      nextDiscountIn: this.config.nthOrder - (this.orderCount[userId] % this.config.nthOrder),
      availableDiscountCode: this.getAvailableDiscountCode(userId),
      discountPercent: this.config.percentage,
      newDiscountGenerated: this.orderCount[userId] % this.config.nthOrder === 0,
    };
  }

  async getStats() {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stats:", error);
      return {
        totalItems: 0,
        totalAmount: 0,
        totalDiscount: 0,
        currentConfig: this.config,
        orderCount: 0,
        recentOrders: [],
      };
    }

    const typedOrders = orders as Order[];

    return {
      totalItems: typedOrders.reduce(
        (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      ),
      totalAmount: typedOrders.reduce((sum, order) => sum + order.total, 0),
      totalDiscount: typedOrders.reduce((sum, order) => sum + order.discount, 0),
      currentConfig: this.config,
      orderCount: typedOrders.length,
      recentOrders: typedOrders.slice(0, 5),
    };
  }
}

export default CartService;
