import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { registerUser } from "@/lib/services/auth.service";

jest.mock("@/lib/services/auth.service", () => ({
  registerUser: jest.fn(),
}));

function makeRequest(body) {
  return new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an account and sets the token cookie", async () => {
    registerUser.mockResolvedValue({
      user: { id: "user_1", name: "Ada", email: "ada@example.com" },
      token: "signed.jwt.token",
    });

    const res = await POST(
      makeRequest({ name: "Ada", email: "ada@example.com", password: "supersecret" })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.user.email).toBe("ada@example.com");
    expect(res.headers.get("set-cookie")).toContain("token=signed.jwt.token");
  });

  it("rejects when a required field is missing", async () => {
    const res = await POST(makeRequest({ name: "Ada", email: "ada@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/all fields are required/i);
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(
      makeRequest({ name: "Ada", email: "not-an-email", password: "supersecret" })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/valid email/i);
  });

  it("rejects a short password", async () => {
    const res = await POST(
      makeRequest({ name: "Ada", email: "ada@example.com", password: "123" })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/at least 6 characters/i);
  });

  it("surfaces a duplicate-account error from the service", async () => {
    registerUser.mockRejectedValue(new Error("An account with this email already exists"));

    const res = await POST(
      makeRequest({ name: "Ada", email: "ada@example.com", password: "supersecret" })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("An account with this email already exists");
  });
});