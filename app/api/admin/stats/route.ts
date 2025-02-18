import { NextResponse } from "next/server";
import CartService from "../../../lib/cart-service";

export async function GET() {
  const cartService = CartService.getInstance();
  const stats = cartService.getStats();
  const config = cartService.getConfig();

  return NextResponse.json({
    ...stats,
    config,
  });
}
