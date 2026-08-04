import { cookies } from "next/headers";
import { getMedicineById } from "@/lib/services";
import Navbar from "@/components/layout/Navbar";
import AppLayout from "@/app/(app)/layout";
import MedicineDetailClient from "@/components/medicines/MedicineDetailClient";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function generateMetadata({ params }) {
  const { id } = params;
  const medicine = await getMedicineById(id);

  if (!medicine) {
    return {
      title: "Medicine Not Found",
      robots: { index: false, follow: true },
    };
  }

  const description =
    medicine.description?.slice(0, 155) ||
    `Buy ${medicine.name} online from PharmEasy. Set up an auto-refill subscription and never miss a dose.`;

  return {
    title: `Buy ${medicine.name} Online`,
    description,
    alternates: {
      canonical: `/medicines/${medicine.id}`,
    },
    openGraph: {
      title: `Buy ${medicine.name} Online | PharmEasy`,
      description,
      type: "website",
      images: medicine.imageUrl ? [{ url: medicine.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `Buy ${medicine.name} Online | PharmEasy`,
      description,
    },
  };
}

export default async function MedicineDetailPage({ params }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const isLoggedIn = !!token;

  let userAddress = "";
  if (isLoggedIn) {
    const userId = getUserIdFromRequest();
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { address: true },
      });
      userAddress = user?.address || "";
    }
  }

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

  const content = <MedicineDetailClient medicine={medicine} isLoggedIn={isLoggedIn} userAddress={userAddress} />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: medicine.name,
    description: medicine.description || `${medicine.name} available on PharmEasy.`,
    category: medicine.category || undefined,
    image: medicine.imageUrl || undefined,
    offers: {
      "@type": "Offer",
      price: medicine.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const structuredData = (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );

  if (isLoggedIn) {
    return (
      <AppLayout>
        {structuredData}
        {content}
      </AppLayout>
    );
  }

  return (
    <>
      {structuredData}
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 80px)", backgroundColor: "var(--bg-main)" }}>
        {content}
      </main>
    </>
  );
}