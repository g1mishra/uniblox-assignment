export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartStats {
  totalItems: number;
  totalAmount: number;
  totalDiscount: number;
  currentConfig: {
    nthOrder: number;
    percentage: number;
  };
  orderCount: number;
  recentOrders: Array<{
    id: string;
    user_id: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      created_at: string;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    used_discount_code: string | null;
    created_at: string;
  }>;
}
