import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getSubscriptions, createSubscription } from "@/lib/services/subscription.service";
import { subscriptionSchema } from "@/lib/validators/subscription.schema";

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

    const body = await request.json();
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid subscription details" },
        { status: 400 }
      );
    }

    const subscription = await createSubscription({ userId, ...parsed.data });
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}