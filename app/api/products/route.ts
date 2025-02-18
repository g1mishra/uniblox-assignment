import { NextResponse } from "next/server";
import CartService from "../../lib/cart-service";

export async function GET() {
  const products = await CartService.getInstance().loadProducts();
  return NextResponse.json(products);
}
