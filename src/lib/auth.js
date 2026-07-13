import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export function getUserIdFromRequest() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

// Verifies the JWT and hydrates name/email from the DB,
// since the token only stores id. Used by the root layout
// to decide which Navbar (marketing vs app) to render.
export async function getCurrentUser() {
  const userId = getUserIdFromRequest();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) return null;

  return { name: user.name, email: user.email };
}