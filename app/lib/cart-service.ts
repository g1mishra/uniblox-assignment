import * as fs from "fs";
import * as path from "path";

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

class CartService {
  private static instance: CartService;
  private orderCount: Record<string, number> = {};
  private discountCodes: Map<string, Set<string>> = new Map();
  private usedDiscountCodes: Map<string, Set<string>> = new Map();
  private config: DiscountConfig = {
    nthOrder: 3,
    percentage: 10,
  };

  private totalRevenue = 0;
  private totalDiscount = 0;
  private totalItems = 0;

  private ordersPath = path.join("data", "orders.json");
  private productsPath = path.join("data", "products.json");

  private constructor() {
    this.initializeFromOrders();
  }

  private initializeFromOrders() {
    const orders = this.loadOrders();
    this.orderCount = {};
    this.totalRevenue = 0;
    this.totalDiscount = 0;
    this.totalItems = 0;

    orders.forEach((order) => {
      if (order.userId) {
        this.orderCount[order.userId] = (this.orderCount[order.userId] || 0) + 1;
        this.initializeUserData(order.userId);
      }
      this.totalRevenue += Number(order.total) || 0;
      this.totalDiscount += Number(order.discount) || 0;
      this.totalItems += order.items.reduce(
        (sum: number, item: { quantity: any }) => sum + Number(item.quantity),
        0
      );
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

  private loadOrders(): any[] {
    try {
      const data = fs.readFileSync(this.ordersPath, "utf-8");
      return JSON.parse(data).orders;
    } catch (error) {
      console.error("Error loading orders:", error);
      return [];
    }
  }

  private saveOrder(order: any) {
    const orders = this.loadOrders();
    const orderToSave = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      usedDiscountCode: order.discount > 0 ? order.discountCode : null,
    };
    orders.push(orderToSave);
    fs.writeFileSync(this.ordersPath, JSON.stringify({ orders }, null, 2));
  }

  loadProducts(): Product[] {
    try {
      const data = fs.readFileSync(this.productsPath, "utf-8");
      return JSON.parse(data).products;
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    }
  }

  checkout(userId: string, items: CartItem[], discountCode?: string) {
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

    const orderSummary = {
      ...order,
      orderNumber: Date.now().toString(),
      nextDiscountIn: this.config.nthOrder - (this.orderCount[userId] % this.config.nthOrder),
      availableDiscountCode: this.getAvailableDiscountCode(userId),
      discountPercent: this.config.percentage,
      newDiscountGenerated: this.orderCount[userId] % this.config.nthOrder === 0,
    };

    this.saveOrder(orderSummary);
    return orderSummary;
  }

  getStats() {
    const orders = this.loadOrders();
    return {
      totalItems: orders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (itemSum: any, item: { quantity: any }) => itemSum + (item.quantity || 0),
            0
          ),
        0
      ),
      totalAmount: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      totalDiscount: orders.reduce((sum, order) => sum + (order.discount || 0), 0),
      currentConfig: this.config,
      orderCount: orders.length,
      recentOrders: orders.slice(-5).reverse(),
    };
  }
}

export default CartService;
