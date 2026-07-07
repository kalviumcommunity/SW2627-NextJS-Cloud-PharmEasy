import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getSubscriptions, createSubscription } from "@/lib/services/subscription.service";

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await getSubscriptions(userId);
    return NextResponse.json(subscriptions);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { medicineId, frequency } = await request.json();
    if (!medicineId || !frequency) {
      return NextResponse.json(
        { message: "Medicine ID and frequency are required" },
        { status: 400 }
      );
    }

    const subscription = await createSubscription({ userId, medicineId, frequency });
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
