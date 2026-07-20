import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/home", "/subscriptions", "/orders", "/notifications", "/profile"];

// Decode and verify HS256 JWT tokens using Web Crypto API (Edge Runtime safe)
async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode base64url to ArrayBuffer helper
    const toBuffer = (base64url) => {
      let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const enc = new TextEncoder();
    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const signature = toBuffer(signatureB64);

    // Import HS256 key
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify token signature
    const isValid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!isValid) return null;

    // Decode and parse payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    // Expiry check
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
  (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
);
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyJWT(token, process.env.JWT_SECRET);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/subscriptions/:path*", "/orders/:path*", "/notifications/:path*", "/profile/:path*"],
};