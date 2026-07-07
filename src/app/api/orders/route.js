import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getOrders } from "@/lib/services/order.service";

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
