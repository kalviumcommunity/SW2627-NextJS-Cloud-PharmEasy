import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { addToCartSchema } from "@/lib/validators/cart.schema";
import { getCart, addToCart } from "@/lib/services/cart.service";

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const items = await getCart(user.id);
  return NextResponse.json({ items });
}

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const item = await addToCart({ userId: user.id, ...parsed.data });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}