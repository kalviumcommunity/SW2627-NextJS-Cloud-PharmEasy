import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getNotifications, markAllAsRead, deleteNotification, deleteAllNotifications } from "@/lib/services";

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getNotifications(userId);
    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await markAllAsRead(userId);
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await deleteNotification(id, userId);
      return NextResponse.json({ message: "Notification deleted" });
    } else {
      await deleteAllNotifications(userId);
      return NextResponse.json({ message: "All notifications deleted" });
    }
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to delete notification(s)" },
      { status: 500 }
    );
  }
}
