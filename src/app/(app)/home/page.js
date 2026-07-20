import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptions } from "@/lib/services/subscription.service";
import { getOrders } from "@/lib/services/order.service";
import { getNotifications } from "@/lib/services/notification.service";
import { getMedicines } from "@/lib/services/medicine.service"; // add this
import DashboardClient from "@/components/home/DashboardClient";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    redirect("/login");
  }

  const subscriptions = await getSubscriptions(userId);
  const orders = await getOrders(userId);
  const notifications = await getNotifications(userId);

  // Suggest medicines the user isn't already subscribed to
  const allMedicines = await getMedicines({});
  const subscribedIds = new Set(subscriptions.map((s) => s.medicineId));
  const exploreMedicines = allMedicines
    .filter((m) => !subscribedIds.has(m.id))
    .slice(0, 5);

  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedSubscriptions = JSON.parse(JSON.stringify(subscriptions));
  const serializedOrders = JSON.parse(JSON.stringify(orders));
  const serializedNotifications = JSON.parse(JSON.stringify(notifications));
  const serializedExploreMedicines = JSON.parse(JSON.stringify(exploreMedicines));

  return (
    <DashboardClient
      initialUser={serializedUser}
      initialSubscriptions={serializedSubscriptions}
      initialOrders={serializedOrders}
      initialNotifications={serializedNotifications}
      initialExploreMedicines={serializedExploreMedicines}
    />
  );
}