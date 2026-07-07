import { NextResponse } from "next/server";
import { getMedicines } from "@/lib/services/medicine.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const medicines = await getMedicines({ query, category });
    return NextResponse.json(medicines);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}
