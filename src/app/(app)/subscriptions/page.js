import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/auth";
import { getSubscriptions } from "@/lib/services/subscription.service";
import SubscriptionsClient from "@/components/subscriptions/SubscriptionsClient";

export default async function SubscriptionsPage() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const subscriptions = await getSubscriptions(userId);
  const serializedSubscriptions = JSON.parse(JSON.stringify(subscriptions));

  return <SubscriptionsClient initialSubscriptions={serializedSubscriptions} />;
}