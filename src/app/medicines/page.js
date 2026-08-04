import { cookies } from "next/headers";
import { getMedicines } from "@/lib/services";
import Navbar from "@/components/layout/Navbar";
import AppLayout from "@/app/(app)/layout";
import MedicinesClient from "@/components/medicines/MedicinesClient";

export function generateMetadata({ searchParams }) {
  const category = searchParams?.category;
  const q = searchParams?.q;

  const title =
    category && category.toLowerCase() !== "all"
      ? `${category} Medicines Online`
      : "Browse Medicines Online";

  const description = q
    ? `Search results for "${q}" — browse genuine medicines available on PharmEasy with fast delivery and auto-refill subscriptions.`
    : "Browse our full catalogue of genuine medicines. Order online with fast delivery or set up an auto-refill subscription.";

  return {
    title,
    description,
    // Search/category query params create near-duplicate URLs for the same
    // content — point crawlers back at the canonical, unfiltered listing.
    alternates: {
      canonical: "/medicines",
    },
  };
}

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