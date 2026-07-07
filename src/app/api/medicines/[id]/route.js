import { NextResponse } from "next/server";
import { getMedicineById } from "@/lib/services/medicine.service";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const medicine = await getMedicineById(id);
    if (!medicine) {
      return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
    }
    return NextResponse.json(medicine);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch medicine details" },
      { status: 500 }
    );
  }
}
