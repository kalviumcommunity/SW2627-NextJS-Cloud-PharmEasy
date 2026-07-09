"use client";

import Link from "next/link";
import { FREQUENCY_LABEL, SUBSCRIPTION_STATUS_LABEL } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date";

export default function DetailDrawer({ open, subscription, onClose }) {
  if (!open || !subscription) return null;

  const { medicine, frequency, status, nextRefillDate } = subscription;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-drawer-title"
      >
        <div className="drawer-header">
          <h3 id="detail-drawer-title">🎉 Subscription Active</h3>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <p style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
            {medicine?.name} will now auto-refill on a {(FREQUENCY_LABEL[frequency] || frequency || "").toLowerCase()} schedule.
          </p>

          <div className="drawer-summary-row">
            <span>Status</span>
            <span className="badge badge-active">{SUBSCRIPTION_STATUS_LABEL[status] || status}</span>
          </div>
          <div className="drawer-summary-row">
            <span>Frequency</span>
            <strong>{FREQUENCY_LABEL[frequency] || frequency}</strong>
          </div>
          <div className="drawer-summary-row">
            <span>Next Refill</span>
            <strong>{formatDate(nextRefillDate)}</strong>
          </div>
        </div>

        <div className="drawer-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Keep Browsing
          </button>
          <Link
            href="/subscriptions"
            className="btn btn-primary"
            style={{ textDecoration: "none", textAlign: "center" }}
          >
            View Subscriptions
          </Link>
        </div>
      </div>
    </div>
  );
}