"use client";

import { FREQUENCY_LABEL } from "@/lib/utils/constants";

export default function FlowDrawer({ open, medicine, frequency, loading, error, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flow-drawer-title"
      >
        <div className="drawer-header">
          <h3 id="flow-drawer-title">Confirm Auto-Refill</h3>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <p style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
            You&apos;re about to set up an auto-refill subscription. Please review the details below.
          </p>

          <div className="drawer-summary-row">
            <span>Medicine</span>
            <strong>{medicine?.name}</strong>
          </div>
          <div className="drawer-summary-row">
            <span>Price</span>
            <strong>₹{medicine?.price}</strong>
          </div>
          <div className="drawer-summary-row">
            <span>Frequency</span>
            <strong>{FREQUENCY_LABEL[frequency] || frequency}</strong>
          </div>

          {error && (
            <div className="auth-error-msg" style={{ marginTop: "16px" }}>
              {error}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Confirming..." : "Confirm Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}