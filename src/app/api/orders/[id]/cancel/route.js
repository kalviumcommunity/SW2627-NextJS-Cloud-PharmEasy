import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { cancelOrder } from "@/lib/services/order.service";

export async function POST(request, { params }) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const order = await cancelOrder(params.id, userId);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to cancel order" },
      { status: 400 }
    );
  }
}