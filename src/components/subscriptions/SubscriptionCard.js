"use client";

import { FREQUENCY_LABEL, SUBSCRIPTION_STATUS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date";

const EMOJI_MAP = {
  diabetes: "💉",
  hypertension: "🩹",
  thyroid: "💊",
  cardiac: "❤️",
  supplements: "🧃",
};

const BADGE_CLASS = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "badge-active",
  [SUBSCRIPTION_STATUS.PAUSED]: "badge-paused",
  [SUBSCRIPTION_STATUS.CANCELLED]: "badge-cancelled",
};

export default function SubscriptionCard({ subscription, onUpdateStatus, loading }) {
  const { medicine, status, frequency, nextRefillDate } = subscription;
  const emoji = EMOJI_MAP[medicine?.category?.toLowerCase()] || "💊";

  return (
    <div className="sub-item-card">
      <div className="sub-item-info">
        <div className="sub-item-icon">{emoji}</div>
        <div className="sub-item-details">
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {medicine?.name}
            <span className={`badge ${BADGE_CLASS[status] || "badge-cancelled"}`}>
              {status.toLowerCase()}
            </span>
          </h4>
          <p style={{ color: "var(--color-text-muted)" }}>
            Frequency: <strong>{FREQUENCY_LABEL[frequency] || frequency}</strong>
          </p>
          {status === SUBSCRIPTION_STATUS.ACTIVE && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "12px", marginTop: "2px" }}>
              Next refill: <strong>{formatDate(nextRefillDate)}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="sub-actions">
        {status === SUBSCRIPTION_STATUS.ACTIVE && (
          <button
            disabled={loading}
            onClick={() => onUpdateStatus(SUBSCRIPTION_STATUS.PAUSED)}
            className="btn btn-secondary btn-sm"
          >
            {loading ? "..." : "Pause"}
          </button>
        )}
        {status === SUBSCRIPTION_STATUS.PAUSED && (
          <button
            disabled={loading}
            onClick={() => onUpdateStatus(SUBSCRIPTION_STATUS.ACTIVE)}
            className="btn btn-primary btn-sm"
          >
            {loading ? "..." : "Resume"}
          </button>
        )}
        {status !== SUBSCRIPTION_STATUS.CANCELLED && (
          <button
            disabled={loading}
            onClick={() => onUpdateStatus(SUBSCRIPTION_STATUS.CANCELLED)}
            className="btn btn-danger-outline btn-sm"
          >
            {loading ? "..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}