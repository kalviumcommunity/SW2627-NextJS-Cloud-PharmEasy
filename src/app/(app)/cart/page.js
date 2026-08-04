import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/auth";
import CartClient from "@/components/cart/CartClient";

export default async function CartPage() {
  const userId = getUserIdFromRequest();

  if (!userId) {
    redirect("/login");
  }

  return <CartClient />;
}