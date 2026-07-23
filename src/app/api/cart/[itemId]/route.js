import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateCartItemSchema } from "@/lib/validators/cart.schema";
import { updateCartItem, removeCartItem } from "@/lib/services/cart.service";

export async function PATCH(req, { params }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const item = await updateCartItem({ userId: user.id, itemId: params.itemId, ...parsed.data });
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    await removeCartItem({ userId: user.id, itemId: params.itemId });
    return NextResponse.json({ message: "Removed" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}