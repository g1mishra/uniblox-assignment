import { CartItem } from "@/types/cart";

export class CheckoutValidator {
  static validateItems(items: CartItem[]): { valid: boolean; error?: string } {
    if (!Array.isArray(items) || items.length === 0) {
      return { valid: false, error: 'Cart is empty' };
    }

    for (const item of items) {
      if (!item.id || !item.name || typeof item.price !== 'number' || item.price <= 0) {
        return { valid: false, error: 'Invalid item data' };
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return { valid: false, error: 'Quantity must be between 1 and 10' };
      }
    }

    return { valid: true };
  }

  static validateUserId(userId: string): { valid: boolean; error?: string } {
    if (!userId || typeof userId !== 'string' || userId.trim().length < 3) {
      return { valid: false, error: 'User ID must be at least 3 characters' };
    }
    return { valid: true };
  }

  static validateDiscountCode(code?: string): { valid: boolean; error?: string } {
    if (!code) return { valid: true };
    
    if (typeof code !== 'string' || code.length < 4) {
      return { valid: false, error: 'Invalid discount code format' };
    }
    return { valid: true };
  }
}
