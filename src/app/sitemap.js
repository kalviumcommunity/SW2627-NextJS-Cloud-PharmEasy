import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pharmeasy-refill.example.com";

// Auto-served at /sitemap.xml by Next.js.
// Only includes public, crawlable routes — auth-gated pages (cart, orders,
// subscriptions, profile, notifications) are deliberately left out and are
// also blocked in robots.js.
export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/medicines`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let medicineRoutes = [];
  try {
    const medicines = await prisma.medicine.findMany({
      select: { id: true, createdAt: true },
    });

    medicineRoutes = medicines.map((medicine) => ({
      url: `${siteUrl}/medicines/${medicine.id}`,
      lastModified: medicine.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (err) {
    // If the DB is unreachable at build time, still ship the static routes
    // rather than failing the whole sitemap.
    console.error("sitemap: failed to load medicines", err);
  }

  return [...staticRoutes, ...medicineRoutes];
}