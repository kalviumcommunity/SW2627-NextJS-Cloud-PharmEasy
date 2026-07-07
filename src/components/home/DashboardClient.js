"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EMOJI_MAP = {
  diabetes: "💉",
  hypertension: "🩹",
  thyroid: "💊",
  cardiac: "❤️",
  supplements: "🧃",
};

export default function DashboardClient({
  initialUser,
  initialSubscriptions,
  initialOrders,
  initialNotifications,
}) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [orders, setOrders] = useState(initialOrders);
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const [actionLoading, setActionLoading] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Stats calculation
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const pausedSubs = subscriptions.filter((s) => s.status === "PAUSED");

  let nextRefillText = "No refills scheduled";
  if (activeSubs.length > 0) {
    const sortedActive = [...activeSubs].sort(
      (a, b) => new Date(a.nextRefillDate) - new Date(b.nextRefillDate)
    );
    const rawDate = new Date(sortedActive[0].nextRefillDate);
    nextRefillText = rawDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const todayText = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Actions
  async function handleUpdateStatus(subId, newStatus) {
    setActionLoading(subId);
    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? updated : s))
        );
      } else {
        alert("Failed to update subscription status");
      }
    } catch (err) {
      console.error(err);
      alert("Error communication with server");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkNotificationsRead() {
    if (unreadNotifsCount === 0) return;

    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {/* Dashboard Greeting Header */}
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Hello, {initialUser.name}!</h1>
          <p>{todayText} | Your auto-refill summary dashboard</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ borderColor: "#fee2e2", color: "#dc2626", backgroundColor: "#fff" }}>
          Log Out
        </button>
      </div>

      {/* Stats Widgets Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Active Subscriptions</span>
          <span className="stat-value">{activeSubs.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next Scheduled Refill</span>
          <span className="stat-value" style={{ fontSize: "20px", marginTop: "10px" }}>{nextRefillText}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Refill Orders</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unread Notifications</span>
          <span className="stat-value">{unreadNotifsCount}</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Subscriptions and Orders */}
        <div>
          {/* Subscriptions Section */}
          <div className="dashboard-section">
            <div className="section-title-area">
              <h2 className="section-title">Your Refill Subscriptions</h2>
              <Link href="/medicines" className="btn btn-primary btn-sm">
                + Add Subscription
              </Link>
            </div>

            {subscriptions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h4>No Subscriptions Yet</h4>
                <p>Browse our catalog and set up auto-refills for medicines you take regularly.</p>
                <Link href="/medicines" className="btn btn-primary" style={{ marginTop: "12px" }}>
                  Browse Medicines
                </Link>
              </div>
            ) : (
              <div className="sub-list">
                {subscriptions.map((sub) => {
                  const emoji = EMOJI_MAP[sub.medicine.category?.toLowerCase()] || "💊";
                  const nextRefillFormatted = new Date(sub.nextRefillDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <div key={sub.id} className="sub-item-card">
                      <div className="sub-item-info">
                        <div className="sub-item-icon">{emoji}</div>
                        <div className="sub-item-details">
                          <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {sub.medicine.name}
                            <span className={`badge ${sub.status === "ACTIVE" ? "badge-active" : sub.status === "PAUSED" ? "badge-paused" : "badge-cancelled"}`}>
                              {sub.status.toLowerCase()}
                            </span>
                          </h4>
                          <p style={{ color: "var(--color-text-muted)" }}>
                            Frequency: <strong>{sub.frequency.toLowerCase()}</strong>
                          </p>
                          {sub.status === "ACTIVE" && (
                            <p style={{ color: "var(--color-text-muted)", fontSize: "12px", marginTop: "2px" }}>
                              Next refill: <strong>{nextRefillFormatted}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="sub-actions">
                        {sub.status === "ACTIVE" && (
                          <button
                            disabled={actionLoading === sub.id}
                            onClick={() => handleUpdateStatus(sub.id, "PAUSED")}
                            className="btn btn-secondary btn-sm"
                          >
                            {actionLoading === sub.id ? "..." : "Pause"}
                          </button>
                        )}
                        {sub.status === "PAUSED" && (
                          <button
                            disabled={actionLoading === sub.id}
                            onClick={() => handleUpdateStatus(sub.id, "ACTIVE")}
                            className="btn btn-primary btn-sm"
                          >
                            {actionLoading === sub.id ? "..." : "Resume"}
                          </button>
                        )}
                        {sub.status !== "CANCELLED" && (
                          <button
                            disabled={actionLoading === sub.id}
                            onClick={() => handleUpdateStatus(sub.id, "CANCELLED")}
                            className="btn btn-danger-outline btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className="dashboard-section">
            <h2 className="section-title" style={{ marginBottom: "20px" }}>Recent Orders</h2>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h4>No Orders Placed</h4>
                <p>Refill orders will be automatically generated and appear here on your refill dates.</p>
              </div>
            ) : (
              <div className="order-table-wrapper">
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Medicine</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      // Extract medicine name from first item or default to subscription medicine
                      const medicineName = order.items?.[0]?.medicine?.name || order.subscription?.medicine?.name || "Medicine";
                      return (
                        <tr key={order.id}>
                          <td style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                            {order.id.substring(0, 8)}...
                          </td>
                          <td>{dateFormatted}</td>
                          <td><strong>{medicineName}</strong></td>
                          <td>₹{order.totalAmount}</td>
                          <td>
                            <span className={`order-status ${order.status === "SUCCESS" ? "order-status-success" : order.status === "PENDING" ? "order-status-pending" : "order-status-failed"}`}>
                              ● {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications */}
        <div>
          <div className="dashboard-section" style={{ minHeight: "360px" }}>
            <div className="section-title-area">
              <h2 className="section-title">Notifications</h2>
              {unreadNotifsCount > 0 && (
                <button
                  disabled={notifLoading}
                  onClick={handleMarkNotificationsRead}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  {notifLoading ? "..." : "Mark Read"}
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: "80px 0" }}>
                <div className="empty-state-icon">🔔</div>
                <p>No notifications.</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                    {!n.read && <div className="notif-unread-dot" />}
                    <div style={{ paddingRight: !n.read ? "12px" : "0" }}>{n.message}</div>
                    <span className="notif-time">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
