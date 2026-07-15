"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const EXPLORE_MEDICINES = [
  { name: "CoQ10", rating: 4.6 },
  { name: "Vitamin D3", rating: 4.8 },
  { name: "Omega-3", rating: 4.7 },
  { name: "Calcium", rating: 4.8 },
  { name: "Vitamin B12", rating: 4.9 },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardClient({
  initialUser,
  initialSubscriptions,
  initialOrders,
  initialNotifications,
}) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [orders] = useState(initialOrders);
  const [notifications, setNotifications] = useState(initialNotifications);

  const [actionLoading, setActionLoading] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Stats calculation
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");

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

  const todayText = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // "This week" chip strip — built from real refill + order data
  const weekChips = useMemo(() => {
    const chips = [];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    activeSubs.forEach((s) => {
      const refillDate = new Date(s.nextRefillDate);
      if (refillDate >= today && refillDate <= weekFromNow) {
        chips.push({
          key: `refill-${s.id}`,
          type: "refill",
          icon: "💊",
          label: `${s.medicine?.name || "Medicine"} refill · ${refillDate.toLocaleDateString(
            "en-IN",
            { weekday: "short" }
          )}`,
        });
      }
    });

    (orders || [])
      .filter((o) => o.status === "PENDING")
      .slice(0, 2)
      .forEach((o) => {
        const placed = new Date(o.createdAt);
        const estDelivery = new Date(placed);
        estDelivery.setDate(estDelivery.getDate() + 3);
        chips.push({
          key: `order-${o.id}`,
          type: "delivery",
          icon: "🚚",
          label: `Order delivery · ${estDelivery.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
          })}`,
        });
      });

    return chips;
  }, [activeSubs, orders]); // eslint-disable-line react-hooks/exhaustive-deps

  // Month calendar generation — builds full per-day detail objects
  // (not just booleans) so the hover tooltip and click modal have real data.
  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // day-of-month -> { refills: [...], deliveries: [...] }
    const dayDetailsMap = {};

    activeSubs.forEach((s) => {
      const refillDate = new Date(s.nextRefillDate);
      if (refillDate.getFullYear() === viewYear && refillDate.getMonth() === viewMonth) {
        const day = refillDate.getDate();
        if (!dayDetailsMap[day]) dayDetailsMap[day] = { refills: [], deliveries: [] };
        dayDetailsMap[day].refills.push({
          id: s.id,
          medicineName: s.medicine?.name || "Medicine",
          frequency: s.frequency,
        });
      }
    });

    (orders || [])
      .filter((o) => o.status === "PENDING")
      .forEach((o) => {
        // No real delivery-date field on Order yet — estimated as createdAt + 3 days.
        const est = new Date(o.createdAt);
        est.setDate(est.getDate() + 3);
        if (est.getFullYear() === viewYear && est.getMonth() === viewMonth) {
          const day = est.getDate();
          if (!dayDetailsMap[day]) dayDetailsMap[day] = { refills: [], deliveries: [] };
          dayDetailsMap[day].deliveries.push({
            id: o.id,
            totalAmount: o.totalAmount,
            estimated: true,
          });
        }
      });

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      const details = dayDetailsMap[day] || { refills: [], deliveries: [] };
      cells.push({
        day,
        date: cellDate,
        isToday: isSameDay(cellDate, today),
        hasRefill: details.refills.length > 0,
        hasDelivery: details.deliveries.length > 0,
        dateLabel: cellDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        weekdayLabel: cellDate.toLocaleDateString("en-IN", { weekday: "long" }),
        refills: details.refills,
        deliveries: details.deliveries,
      });
    }
    return cells;
  }, [viewYear, viewMonth, activeSubs, orders]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

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
      {/* Header: greeting + compact stats */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {initialUser.name}
          </h1>
          <p className="dashboard-date">{todayText}</p>
        </div>

        <div className="dashboard-stats-inline">
          <div className="stat-pill">
            <span className="stat-pill-label">Next refill</span>
            <span className="stat-pill-value">{nextRefillText}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-label">Active subscriptions</span>
            <span className="stat-pill-value">{activeSubs.length}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm logout-btn-inline"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* This week chip strip */}
      {weekChips.length > 0 && (
        <div className="week-chip-strip">
          {weekChips.map((chip) => (
            <span className={`week-chip week-chip-${chip.type}`} key={chip.key}>
              <span className="week-chip-icon">{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Calendar */}
        <div>
          <div className="dashboard-section calendar-card">
            <div className="calendar-card-header">
              <h2 className="section-title">📅 {monthLabel}</h2>

              <div className="calendar-legend">
                <span className="legend-item">
                  <i className="legend-dot legend-dot-refill" /> Refill
                </span>
                <span className="legend-item">
                  <i className="legend-dot legend-dot-delivery" /> Delivery
                </span>
              </div>

              <div className="calendar-nav">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                  className="calendar-nav-btn"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                  className="calendar-nav-btn"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-weekday-row">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="calendar-month-grid">
              {calendarCells.map((cell, i) =>
                cell ? (
                  <div
                    className="calendar-day"
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDay(cell)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedDay(cell);
                    }}
                  >
                    {cell.isToday ? (
                      <span className="today-number-badge">{cell.day}</span>
                    ) : (
                      <span>{cell.day}</span>
                    )}
                    {cell.hasRefill && <div className="refill-dot" />}
                    {cell.hasDelivery && <div className="delivery-dot" />}

                    {/* Hover tooltip: pure CSS, no extra requests — date always shows,
                        detail rows only render if that day actually has a refill/delivery */}
                    <div className="day-tooltip">
                      <div className="day-tooltip-date">{cell.dateLabel}</div>
                      <div className="day-tooltip-weekday">{cell.weekdayLabel}</div>
                      {cell.refills.map((r) => (
                        <div className="day-tooltip-item day-tooltip-refill" key={`r-${r.id}`}>
                          💊 {r.medicineName} refill
                        </div>
                      ))}
                      {cell.deliveries.map((d) => (
                        <div className="day-tooltip-item day-tooltip-delivery" key={`d-${d.id}`}>
                          🚚 Order delivery (est.)
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="calendar-day calendar-day-empty" key={i} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications + Explore Medicines */}
        <div className="right-sidebar">
          <div className="dashboard-section notifications">
            <div className="section-title-area">
              <h2 className="section-title">Notifications</h2>
              <Link href="/notifications" className="view-all-link">
                View all →
              </Link>
            </div>

            {unreadNotifsCount > 0 && (
              <button
                disabled={notifLoading}
                onClick={handleMarkNotificationsRead}
                className="mark-read-link"
              >
                {notifLoading ? "Marking..." : `Mark ${unreadNotifsCount} as read`}
              </button>
            )}

            <div className="notif-list">
              {notifications.length === 0 && (
                <p className="notif-empty">You're all caught up.</p>
              )}
              {notifications.slice(0, 2).map((n) => (
                <div className="notification-card" key={n.id}>
                  <h4>{n.message}</h4>
                  <p>
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section explore-card">
            <h2 className="section-title">Explore Medicines</h2>
            <p className="explore-subtitle">Based on what you take</p>

            {EXPLORE_MEDICINES.map((med) => (
              <div className="medicine-item" key={med.name}>
                <div>
                  💊 {med.name}
                  <br />
                  ⭐{med.rating}
                </div>
                <button className="btn btn-primary btn-sm">Add</button>
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              <Link href="/medicines">View more →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Click modal: full details for the selected day */}
      {selectedDay && (
        <div className="day-modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-modal-header">
              <div>
                <h3>{selectedDay.dateLabel}</h3>
                <p className="day-modal-weekday">{selectedDay.weekdayLabel}</p>
              </div>
              <button
                className="day-modal-close"
                onClick={() => setSelectedDay(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="day-modal-body">
              {selectedDay.refills.map((r) => (
                <div className="day-modal-item" key={`r-${r.id}`}>
                  <span className="day-modal-item-icon refill-icon">💊</span>
                  <div>
                    <p className="day-modal-item-title">{r.medicineName} refill due</p>
                    {r.frequency && (
                      <p className="day-modal-item-sub">Frequency: {r.frequency}</p>
                    )}
                  </div>
                </div>
              ))}

              {selectedDay.deliveries.map((d) => (
                <div className="day-modal-item" key={`d-${d.id}`}>
                  <span className="day-modal-item-icon delivery-icon">🚚</span>
                  <div>
                    <p className="day-modal-item-title">Order delivery expected</p>
                    <p className="day-modal-item-sub">
                      Order #{d.id.slice(-4)} · ₹{d.totalAmount?.toFixed(2)} (estimated date)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}