import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/orders/route";
import { getUserIdFromRequest } from "@/lib/auth";
import { getOrders, createDirectOrder } from "@/lib/services/order.service";

jest.mock("@/lib/auth", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/services/order.service", () => ({
  getOrders: jest.fn(),
  createDirectOrder: jest.fn(),
}));

function makePostRequest(body) {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/orders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no authenticated user", async () => {
    getUserIdFromRequest.mockReturnValue(null);

    const res = await GET(new NextRequest("http://localhost:3000/api/orders"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
    expect(getOrders).not.toHaveBeenCalled();
  });

  it("returns only the authenticated user's orders", async () => {
    getUserIdFromRequest.mockReturnValue("user_1");
    getOrders.mockResolvedValue([{ id: "order_1", userId: "user_1" }]);

    const res = await GET(new NextRequest("http://localhost:3000/api/orders"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getOrders).toHaveBeenCalledWith("user_1");
    expect(body).toEqual([{ id: "order_1", userId: "user_1" }]);
  });
});

describe("POST /api/orders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no authenticated user", async () => {
    getUserIdFromRequest.mockReturnValue(null);

    const res = await POST(makePostRequest({ medicineId: "med_1", quantity: 2 }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
    expect(createDirectOrder).not.toHaveBeenCalled();
  });

  it("creates an order for the authenticated user with valid input", async () => {
    getUserIdFromRequest.mockReturnValue("user_1");
    createDirectOrder.mockResolvedValue({ id: "order_1", userId: "user_1", totalAmount: 40 });

    const res = await POST(makePostRequest({ medicineId: "med_1", quantity: 2 }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(createDirectOrder).toHaveBeenCalledWith({
      userId: "user_1",
      medicineId: "med_1",
      quantity: 2,
    });
    expect(body.id).toBe("order_1");
  });

  it("rejects invalid input (e.g. missing medicineId) with a 400 before hitting the service", async () => {
    getUserIdFromRequest.mockReturnValue("user_1");

    const res = await POST(makePostRequest({ quantity: 2 }));

    expect(res.status).toBe(400);
    expect(createDirectOrder).not.toHaveBeenCalled();
  });
});