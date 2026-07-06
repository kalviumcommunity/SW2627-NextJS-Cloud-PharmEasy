import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}