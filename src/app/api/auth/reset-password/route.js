import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/auth.service";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    const data = await resetPassword({ token, newPassword });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Reset password failed" },
      { status: 400 }
    );
  }
}