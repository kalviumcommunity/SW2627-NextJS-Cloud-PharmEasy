import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pharmeasy-refill.example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PharmEasy — Trusted Online Pharmacy & Auto-Refill Subscriptions",
    template: "%s | PharmEasy",
  },
  description:
    "Order genuine medicines online from a licensed pharmacy with fast delivery. Set up automatic refill subscriptions, pause or cancel anytime, and never miss a dose.",
  keywords: [
    "online pharmacy",
    "medicine auto refill",
    "buy medicines online",
    "medicine subscription",
    "recurring medicine delivery",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    siteName: "PharmEasy",
    title: "PharmEasy — Trusted Online Pharmacy & Auto-Refill Subscriptions",
    description:
      "Order genuine medicines online with fast delivery. Set up automatic refill subscriptions and never miss a dose.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PharmEasy — Trusted Online Pharmacy & Auto-Refill Subscriptions",
    description:
      "Order genuine medicines online with fast delivery. Set up automatic refill subscriptions and never miss a dose.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}