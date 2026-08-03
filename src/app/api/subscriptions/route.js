import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  createSubscription,
  updateSubscriptionStatus,
  updateSubscriptionFrequency,
  skipNextRefill,
} from "@/lib/services";

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { medicineId, frequency } = body;

    const subscription = await createSubscription({ userId, medicineId, frequency });
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, frequency, action } = await request.json();

    if (action === "skip") {
      const updated = await skipNextRefill(id, userId);
      return NextResponse.json(updated);
    }

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