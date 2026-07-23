import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserIdFromRequest } from "@/lib/auth";
import { getMedicineById } from "@/lib/services/medicine.service";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage({ searchParams }) {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const fromCart = searchParams?.fromCart === "1";
  const medicineId = searchParams?.medicineId;

  if (fromCart) {
    return (
      <div>
        <div className="dashboard-header">
          <h1>Checkout</h1>
          <p>Review your cart and complete payment.</p>
        </div>
        <CheckoutClient mode="cart" />
      </div>
    );
  }

  const medicine = medicineId ? await getMedicineById(medicineId) : null;

  if (!medicine) {
    return (
      <div className="dashboard-section" style={{ textAlign: "center", padding: "60px 24px" }}>
        <h1 style={{ marginBottom: "16px" }}>No Medicine Selected</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Choose a medicine to buy before checking out.
        </p>
        <Link href="/medicines" className="btn btn-primary">
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Checkout</h1>
        <p>Complete your purchase for {medicine.name}.</p>
      </div>
      <CheckoutClient mode="single" medicine={JSON.parse(JSON.stringify(medicine))} />
    </div>
  );
}