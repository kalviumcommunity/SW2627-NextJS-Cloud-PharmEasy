import "./globals.css";
import Navbar from "@/components/marketing/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "PharmEasy — Trusted Online Pharmacy & Auto-Refill Subscriptions",
  description:
    "Order genuine medicines online from a licensed pharmacy with fast delivery. Set up automatic refill subscriptions, pause or cancel anytime, and never miss a dose.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}