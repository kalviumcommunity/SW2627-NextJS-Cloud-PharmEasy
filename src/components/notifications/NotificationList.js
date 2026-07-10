"use client";

import { useState } from "react";
import { NOTIFICATION_TYPE } from "@/lib/utils/constants";
import { formatDateTime } from "@/lib/utils/date";

const TYPE_ICON = {
  [NOTIFICATION_TYPE.REFILL_REMINDER]: "⏰",
  [NOTIFICATION_TYPE.PAYMENT_SUCCESS]: "✅",
  [NOTIFICATION_TYPE.PAYMENT_FAILED]: "⚠️",
  [NOTIFICATION_TYPE.ORDER_FAILED]: "❌",
};

export default function NotificationList({ initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkAllRead() {
    if (unreadCount === 0) return;

    setMarking(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update notifications");
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <div>
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1>Your Notifications</h1>
          <p>Stay updated on your upcoming refills and payments.</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleMarkAllRead}
          disabled={marking || unreadCount === 0}
        >
          {marking ? "Marking..." : `Mark all read${unreadCount ? ` (${unreadCount})` : ""}`}
        </button>
      </div>

      <div className="dashboard-section">
        {error && (
          <p style={{ color: "#dc2626", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h4>No Notifications Yet</h4>
            <p>Refill reminders and payment updates will show up here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`}>
                {!n.read && <span className="notif-unread-dot" aria-hidden="true" />}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span aria-hidden="true">{TYPE_ICON[n.type] || "🔔"}</span>
                  <div>
                    <p style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                    <span className="notif-time">{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}