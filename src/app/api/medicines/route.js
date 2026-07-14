import { NextResponse } from "next/server";
import { getMedicines } from "@/lib/services/medicine.service";
import { validateMedicineQuery } from "@/lib/validators/medicine.schema";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const validation = validateMedicineQuery({ q, category });
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0]?.message || "Invalid search query parameters" },
        { status: 400 }
      );
    }

    const medicines = await getMedicines({ query: validation.data.q, category: validation.data.category });
    return NextResponse.json(medicines);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}
