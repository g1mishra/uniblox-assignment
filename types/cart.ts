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
  orderCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    userId: string;
    items: CartItem[];
    total: number;
    discount: number;
    createdAt: string;
  }>;
  currentConfig: {
    nthOrder: number;
    percentage: number;
  };
}
