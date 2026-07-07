import { cookies } from "next/headers";
import { getMedicineById } from "@/lib/services/medicine.service";
import Navbar from "@/components/marketing/Navbar";
import AppLayout from "@/app/(app)/layout";
import MedicineDetailClient from "@/components/medicines/MedicineDetailClient";

export default async function MedicineDetailPage({ params }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const isLoggedIn = !!token;

  const { id } = params;
  const medicine = await getMedicineById(id);

  if (!medicine) {
    const errorContent = (
      <div className="meds-page-container" style={{ textAlign: "center", padding: "80px 24px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>Medicine Not Found</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          The medicine you are looking for does not exist or has been removed.
        </p>
        <a href="/medicines" className="btn btn-primary">
          Back to Medicines
        </a>
      </div>
    );

    if (isLoggedIn) {
      return <AppLayout>{errorContent}</AppLayout>;
    }

    return (
      <>
        <Navbar />
        <main>{errorContent}</main>
      </>
    );
  }

  const content = <MedicineDetailClient medicine={medicine} isLoggedIn={isLoggedIn} />;

  if (isLoggedIn) {
    return <AppLayout>{content}</AppLayout>;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 80px)", backgroundColor: "var(--bg-main)" }}>
        {content}
      </main>
    </>
  );
}
