import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/auth";
import { getNotifications } from "@/lib/services/notification.service";
import NotificationList from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const notifications = await getNotifications(userId);
  const serializedNotifications = JSON.parse(JSON.stringify(notifications));

  return <NotificationList initialNotifications={serializedNotifications} />;
}