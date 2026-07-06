import { NextResponse } from "next/server";
import { registerUser } from "@/lib/services/auth.service";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ message: "Please enter a valid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const { user, token } = await registerUser({ name, email, password });

    const response = NextResponse.json({ message: "Account created", user }, { status: 201 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json({ message: err.message || "Registration failed" }, { status: 400 });
  }
}
// 
