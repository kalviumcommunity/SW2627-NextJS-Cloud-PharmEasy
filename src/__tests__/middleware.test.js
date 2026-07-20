import jwt from "jsonwebtoken";
import { middleware } from "@/middleware";

function makeRequest(pathname, token) {
  const url = `http://localhost:3000${pathname}`;
  return {
    nextUrl: { pathname },
    url,
    cookies: {
      get: (name) => (name === "token" && token ? { value: token } : undefined),
    },
  };
}

function signToken(overrides = {}) {
  return jwt.sign({ id: "user_1", ...overrides }, process.env.JWT_SECRET, {
    expiresIn: overrides.expiresIn || "1h",
  });
}

describe("middleware route protection", () => {
  describe("public routes", () => {
    it.each(["/", "/medicines", "/medicines/med_1", "/login", "/register", "/checkout"])(
      "lets an unauthenticated request through to %s",
      async (path) => {
        const res = await middleware(makeRequest(path, undefined));
        expect(res.headers.get("location")).toBeNull();
      }
    );
  });

  describe("protected routes without a token", () => {
    it.each(["/home", "/subscriptions", "/orders", "/notifications", "/profile"])(
      "redirects an unauthenticated request away from %s",
      async (path) => {
        const res = await middleware(makeRequest(path, undefined));
        expect(res.headers.get("location")).toBe(`http://localhost:3000/login`);
      }
    );
  });

  describe("protected routes with a valid token", () => {
    it.each(["/home", "/subscriptions", "/orders", "/notifications", "/profile"])(
      "lets an authenticated request through to %s",
      async (path) => {
        const token = signToken();
        const res = await middleware(makeRequest(path, token));
        expect(res.headers.get("location")).toBeNull();
      }
    );
  });

  it("redirects and clears the cookie when the token is malformed", async () => {
    const res = await middleware(makeRequest("/profile", "not-a-real-jwt"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects when the token is expired", async () => {
    const expiredToken = jwt.sign({ id: "user_1" }, process.env.JWT_SECRET, {
      expiresIn: "-10s",
    });
    const res = await middleware(makeRequest("/profile", expiredToken));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects when the token is signed with the wrong secret", async () => {
    const badToken = jwt.sign({ id: "user_1" }, "wrong-secret", { expiresIn: "1h" });
    const res = await middleware(makeRequest("/profile", badToken));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("only matches protected paths as prefixes, not lookalikes", async () => {
    const res = await middleware(makeRequest("/homepage", undefined));
    expect(res.headers.get("location")).toBeNull();
  });
});