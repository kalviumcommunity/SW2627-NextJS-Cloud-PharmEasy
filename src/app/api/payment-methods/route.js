import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedCardSchema } from "@/lib/validators/payment.schema";

export async function GET() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const paymentMethod = await prisma.paymentMethod.findUnique({ where: { userId } });
  return NextResponse.json({ paymentMethod });
}

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = savedCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid card details" },
        { status: 400 }
      );
    }

    const { cardName, cardNumber, expiry } = parsed.data;
    const last4 = cardNumber.slice(-4);

    const paymentMethod = await prisma.paymentMethod.upsert({
      where: { userId },
      update: { cardHolderName: cardName, last4, expiry },
      create: { userId, cardHolderName: cardName, last4, expiry },
    });

    return NextResponse.json({ message: "Card saved", paymentMethod });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to save card" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await prisma.paymentMethod.deleteMany({ where: { userId } });
  return NextResponse.json({ message: "Card removed" });
}