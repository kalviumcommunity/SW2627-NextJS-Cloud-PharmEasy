import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PROTECTED_PREFIXES = ["/home", "/subscriptions", "/orders", "/notifications", "/profile"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/home/:path*", "/subscriptions/:path*", "/orders/:path*", "/notifications/:path*", "/profile/:path*"],
};