import { NextResponse } from "next/server";
import { loginUser } from "@/lib/services/auth.service";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Please fill all the fields" }, { status: 400 });
    }

    const { user, token } = await loginUser({ email, password });

    const isHttps = request.nextUrl.protocol === "https:";

    const response = NextResponse.json({ message: "Login successful", user });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isHttps, // only require https when actually served over https (fixes localhost cookie being dropped)
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json({ message: err.message || "Login failed" }, { status: 401 });
  }
}