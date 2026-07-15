import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attemptPayment } from "@/lib/services/payment.service";
import { paymentSchema } from "@/lib/validators/payment.schema";

/**
 * Checkout "Pay Now" endpoint. Unlike /api/orders/[id]/attempt-payment
 * (the demo "Simulate Success/Failure" buttons on the Order History page,
 * which force an outcome), this validates a simulated card and then lets
 * the payment engine decide the outcome for real, at
 * PAYMENT_SUCCESS_PROBABILITY — same as a scheduler-driven attempt.
 *
 * Card details are validated for shape only and are never persisted or
 * logged; attemptPayment() only ever stores a status on the Payment row.
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
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid card details" },
        { status: 400 }
      );
    }

    const result = await attemptPayment(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to process payment" },
      { status: 500 }
    );
  }
}