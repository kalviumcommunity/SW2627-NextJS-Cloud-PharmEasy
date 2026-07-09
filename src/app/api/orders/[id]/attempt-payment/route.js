import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attemptPayment } from "@/lib/services/payment.service";
import { PAYMENT_STATUS } from "@/lib/utils/constants";

/**
 * Manual demo control: "Simulate Success" / "Simulate Failure" buttons call
 * this to force a payment outcome for one of the current user's orders,
 * without waiting for the scheduler or the random simulation.
 *
 * Body: { "outcome": "success" | "failure" }
 */
export async function POST(request, { params }) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const outcome = (body?.outcome || "").toLowerCase();

    const forceOutcome =
      outcome === "success"
        ? PAYMENT_STATUS.SUCCESS
        : outcome === "failure"
        ? PAYMENT_STATUS.FAILED
        : null;

    if (!forceOutcome) {
      return NextResponse.json(
        { message: "'outcome' must be 'success' or 'failure'" },
        { status: 400 }
      );
    }

    const result = await attemptPayment(id, { forceOutcome });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to attempt payment" },
      { status: 500 }
    );
  }
}