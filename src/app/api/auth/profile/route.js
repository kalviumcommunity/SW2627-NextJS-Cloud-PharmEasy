import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { address } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { address },
      select: { id: true, name: true, email: true, address: true },
    });

    return NextResponse.json({ message: "Profile updated", user });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}