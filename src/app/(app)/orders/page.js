import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/auth";
import { getOrders } from "@/lib/services/order.service";
import OrderTable from "@/components/orders/OrderTable";

export default async function OrdersPage() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const orders = await getOrders(userId);
  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return <OrderTable initialOrders={serializedOrders} />;
}