import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

const JWT_SECRET = process.env.JWT_SECRET;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashedPassword },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
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

// Ported from AuthHub's `Forgot` service. Mongoose's resetPasswordToken /
// resetPasswordExpire fields map onto this project's existing Prisma
// columns: User.resetOtp (stores the hashed token) and User.resetOtpExpiry.
export async function forgotPassword({ email, origin }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  // Don't reveal whether an account exists - respond the same way either way.
  if (!user) {
    return { message: "If that email is registered, a reset link has been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetOtp: hashedToken,
      resetOtpExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const frontendUrl = origin || process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Password Reset",
    text: `You can reset your password using this link: ${resetLink}`,
    html: `<p>You can reset your password using this link: <a href="${resetLink}">${resetLink}</a></p>`,
  });

  return { message: "If that email is registered, a reset link has been sent." };
}

// Ported from AuthHub's `reset` service.
export async function resetPassword({ token, newPassword }) {
  if (!token) {
    throw new Error("Reset token is required");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetOtp: hashedToken,
      resetOtpExpiry: { gt: new Date() }, // token expiry check
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset link");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiry: null,
    },
  });

  return { message: "Password reset successfully" };
}