import "./globals.css";

export const metadata = {
  title: "PharmEasy — Trusted Online Pharmacy & Auto-Refill Subscriptions",
  description:
    "Order genuine medicines online from a licensed pharmacy with fast delivery. Set up automatic refill subscriptions, pause or cancel anytime, and never miss a dose.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}