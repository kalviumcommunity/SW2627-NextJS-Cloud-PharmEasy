import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const userId = getUserIdFromRequest();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [subscriptionCount, orderCount] = await Promise.all([
    prisma.subscription.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
  ]);

  const serializedUser = JSON.parse(JSON.stringify(user));

  return (
    <ProfileClient
      user={serializedUser}
      subscriptionCount={subscriptionCount}
      orderCount={orderCount}
    />
  );
}