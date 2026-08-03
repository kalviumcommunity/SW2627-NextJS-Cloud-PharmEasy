const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pharmeasy-refill.example.com";

// Auto-served at /robots.txt by Next.js.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/orders",
        "/subscriptions",
        "/profile",
        "/notifications",
        "/home",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}