import { cookies } from "next/headers";
import { getMedicines } from "@/lib/services/medicine.service";
import Navbar from "@/components/marketing/Navbar";
import AppLayout from "@/app/(app)/layout";
import MedicinesClient from "@/components/medicines/MedicinesClient";

export default async function MedicinesPage({ searchParams }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const isLoggedIn = !!token;

  const q = searchParams?.q || "";
  const category = searchParams?.category || "";

  const medicines = await getMedicines({ query: q, category });

  const content = (
    <MedicinesClient
      initialMedicines={medicines}
      initialQuery={q}
      initialCategory={category}
      isLoggedIn={isLoggedIn}
    />
  );

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
