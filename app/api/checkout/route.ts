import { NextResponse } from "next/server";
import CartService from "../../lib/cart-service";
import { CheckoutValidator } from "../../lib/checkout-validator";

export async function POST(req: Request) {
  try {
    const { items, discountCode, userId } = await req.json();

    const userValidation = CheckoutValidator.validateUserId(userId);
    if (!userValidation.valid) {
      return NextResponse.json({ error: userValidation.error }, { status: 400 });
    }

    const itemsValidation = CheckoutValidator.validateItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json({ error: itemsValidation.error }, { status: 400 });
    }

    if (discountCode) {
      const discountValidation = CheckoutValidator.validateDiscountCode(discountCode);
      if (!discountValidation.valid) {
        return NextResponse.json({ error: discountValidation.error }, { status: 400 });
      }
    }

    const result = await CartService.getInstance().checkout(userId, items, discountCode);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during checkout" },
      { status: 400 }
    );
  }
}
