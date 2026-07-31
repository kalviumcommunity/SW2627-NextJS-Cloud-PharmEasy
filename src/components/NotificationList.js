"use client";

import { useState } from "react";
import { NOTIFICATION_TYPE, formatDateTime } from "@/lib/utils";

const TYPE_ICON = {
  [NOTIFICATION_TYPE.REFILL_REMINDER]: "⏰",
  [NOTIFICATION_TYPE.REFILL_SKIPPED]: "⏭️",
  [NOTIFICATION_TYPE.PAYMENT_SUCCESS]: "✅",
  [NOTIFICATION_TYPE.PAYMENT_FAILED]: "⚠️",
  [NOTIFICATION_TYPE.ORDER_FAILED]: "❌",
};

export default function NotificationList({ initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [marking, setMarking] = useState(false);
  const [clearing, setClearing] = useState(false);
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

  async function handleDeleteNotification(id) {
    try {
      setError(null);
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete notification");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  async function handleClearAll() {
    if (notifications.length === 0) return;
    if (!confirm("Are you sure you want to delete all notifications?")) return;

    setClearing(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete notifications");
      }

      setNotifications([]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setClearing(false);
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

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllRead}
            disabled={marking || unreadCount === 0}
          >
            {marking ? "Marking..." : `Mark all read${unreadCount ? ` (${unreadCount})` : ""}`}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: "#dc2626", borderColor: "rgba(220, 38, 38, 0.2)" }}
            onClick={handleClearAll}
            disabled={clearing || notifications.length === 0}
          >
            {clearing ? "Clearing..." : "Clear all"}
          </button>
        </div>
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
              <div
                key={n.id}
                className={`notif-item${n.read ? "" : " unread"}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flex: 1 }}>
                  <span aria-hidden="true">{TYPE_ICON[n.type] || "🔔"}</span>
                  <div>
                    <p style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                    <span className="notif-time">{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "16px" }}>
                  {!n.read && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "var(--color-primary)",
                        borderRadius: "50%",
                        display: "inline-block",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(n.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}