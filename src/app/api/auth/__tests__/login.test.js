import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { loginUser } from "@/lib/services/auth.service";

jest.mock("@/lib/services/auth.service", () => ({
  loginUser: jest.fn(),
}));

function makeRequest(body) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("logs in successfully and sets an httpOnly token cookie", async () => {
    loginUser.mockResolvedValue({
      user: { id: "user_1", name: "Ada", email: "ada@example.com" },
      token: "signed.jwt.token",
    });

    const res = await POST(makeRequest({ email: "ada@example.com", password: "supersecret" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe("ada@example.com");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("token=signed.jwt.token");
    expect(setCookie).toContain("HttpOnly");
  });

  it("rejects when email or password is missing", async () => {
    const res = await POST(makeRequest({ email: "ada@example.com" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/fill all the fields/i);
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("returns 401 with the service's error message on bad credentials", async () => {
    loginUser.mockRejectedValue(new Error("Invalid email or password"));

    const res = await POST(makeRequest({ email: "ada@example.com", password: "wrong" }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toBe("Invalid email or password");
  });
});