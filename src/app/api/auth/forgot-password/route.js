import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/services/auth.service";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.FRONTEND_URL ||
      new URL(request.url).origin;

    const data = await forgotPassword({ email, origin });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to process forgot password request" },
      { status: 400 }
    );
  }
}