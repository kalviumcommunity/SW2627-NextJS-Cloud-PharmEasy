import { NextRequest } from "next/server";
import { GET } from "@/app/api/medicines/route";
import { getMedicines } from "@/lib/services/medicine.service";

jest.mock("@/lib/services/medicine.service", () => ({
  getMedicines: jest.fn(),
}));

describe("GET /api/medicines", () => {
  beforeEach(() => jest.clearAllMocks());

  it("is publicly accessible and returns the medicine list with no query params", async () => {
    getMedicines.mockResolvedValue([{ id: "med_1", name: "Paracetamol" }]);

    const req = new NextRequest("http://localhost:3000/api/medicines");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: "med_1", name: "Paracetamol" }]);
    expect(getMedicines).toHaveBeenCalledWith({ query: "", category: "" });
  });

  it("passes through search and category query params", async () => {
    getMedicines.mockResolvedValue([]);

    const req = new NextRequest(
      "http://localhost:3000/api/medicines?q=paracetamol&category=Pain%20Relief"
    );
    await GET(req);

    expect(getMedicines).toHaveBeenCalledWith({ query: "paracetamol", category: "Pain Relief" });
  });

  it("rejects an overly long search query with a 400", async () => {
    const tooLong = "a".repeat(101);
    const req = new NextRequest(`http://localhost:3000/api/medicines?q=${tooLong}`);

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/under 100 characters/i);
    expect(getMedicines).not.toHaveBeenCalled();
  });
});