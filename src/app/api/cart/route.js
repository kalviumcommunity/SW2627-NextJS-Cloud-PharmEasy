import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { addToCartSchema } from "@/lib/validators/cart.schema";
import { getCart, addToCart } from "@/lib/services/cart.service";

export async function GET(req) {
  const userId = getUserIdFromRequest();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const items = await getCart(userId);
  return NextResponse.json({ items });
}

export async function POST(req) {
  const userId = getUserIdFromRequest();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const item = await addToCart({ userId, ...parsed.data });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}