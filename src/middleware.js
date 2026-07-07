import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/home", "/subscriptions", "/orders", "/notifications", "/profile"];

function base64UrlToUint8Array(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

async function isValidToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const data = `${headerPart}.${payloadPart}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expectedSignature = new Uint8Array(signature);
  const actualSignature = base64UrlToUint8Array(signaturePart);

  if (expectedSignature.length !== actualSignature.length) {
    return false;
  }

  for (let index = 0; index < expectedSignature.length; index += 1) {
    if (expectedSignature[index] !== actualSignature[index]) {
      return false;
    }
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadPart)));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
  } catch (err) {
    return false;
  }

  return true;
}

export async function middleware(request) {
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
    const valid = await isValidToken(token);
    if (!valid) {
      throw new Error("Invalid token");
    }
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