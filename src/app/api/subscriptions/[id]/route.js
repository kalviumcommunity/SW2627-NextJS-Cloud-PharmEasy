import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { updateSubscriptionStatus, updateSubscriptionFrequency } from "@/lib/services/subscription.service";

export async function PATCH(request, { params }) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, frequency } = await request.json();

    if (!status && !frequency) {
      return NextResponse.json(
        { message: "Provide a status or frequency to update" },
        { status: 400 }
      );
    }

    let updated;
    if (frequency) {
      updated = await updateSubscriptionFrequency(id, userId, frequency);
    }
    if (status) {
      updated = await updateSubscriptionStatus(id, userId, status);
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}