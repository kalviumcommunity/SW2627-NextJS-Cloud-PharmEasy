import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("registerUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a new user with a lowercased email and a hashed password", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_pw");
    prisma.user.create.mockResolvedValue({
      id: "user_1",
      name: "Ada",
      email: "ada@example.com",
    });

    const { user, token } = await registerUser({
      name: "Ada",
      email: "  Ada@Example.com  ",
      password: "supersecret",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "ada@example.com" } });
    expect(bcrypt.hash).toHaveBeenCalledWith("supersecret", 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: "Ada", email: "ada@example.com", password: "hashed_pw" },
    });
    expect(user).toEqual({ id: "user_1", name: "Ada", email: "ada@example.com" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe("user_1");
  });

  it("rejects registration when the email is already taken", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "existing_user" });

    await expect(
      registerUser({ name: "Ada", email: "ada@example.com", password: "supersecret" })
    ).rejects.toThrow("An account with this email already exists");

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a user and a valid token on correct credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      name: "Ada",
      email: "ada@example.com",
      password: "hashed_pw",
    });
    bcrypt.compare.mockResolvedValue(true);

    const { user, token } = await loginUser({ email: "ada@example.com", password: "supersecret" });

    expect(bcrypt.compare).toHaveBeenCalledWith("supersecret", "hashed_pw");
    expect(user).toEqual({ id: "user_1", name: "Ada", email: "ada@example.com" });
    expect(jwt.verify(token, process.env.JWT_SECRET).id).toBe("user_1");
  });

  it("rejects when no account exists for the email", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(loginUser({ email: "nobody@example.com", password: "x" })).rejects.toThrow(
      "Invalid email or password"
    );
  });

  it("rejects when the password does not match, without revealing which part was wrong", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      password: "hashed_pw",
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(loginUser({ email: "ada@example.com", password: "wrong" })).rejects.toThrow(
      "Invalid email or password"
    );
  });

  it("normalizes email case/whitespace before lookup", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: "  Ada@Example.com ", password: "x" })
    ).rejects.toThrow();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "ada@example.com" } });
  });
});