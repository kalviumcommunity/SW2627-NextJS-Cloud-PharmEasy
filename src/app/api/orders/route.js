import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getOrders, createDirectOrder } from "@/lib/services/order.service";
import { directOrderSchema } from "@/lib/validators/order.schema";

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await getOrders(userId);
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * Creates a direct ("Buy Now") order for a medicine, outside the
 * subscription/scheduler flow. Used by the checkout page before it calls
 * /api/orders/[id]/pay to actually process payment.
 */
export async function POST(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = directOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid order details" },
        { status: 400 }
      );
    }

    const order = await createDirectOrder({ userId, ...parsed.data });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}