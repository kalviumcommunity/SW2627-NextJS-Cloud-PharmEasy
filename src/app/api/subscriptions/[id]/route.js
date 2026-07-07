import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { updateSubscriptionStatus } from "@/lib/services/subscription.service";

export async function PATCH(request, { params }) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const updated = await updateSubscriptionStatus(id, userId, status);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
