"use client";

import { useState } from "react";
import { FREQUENCY_LABEL } from "@/lib/utils/constants";
import CardForm from "@/components/checkout/CardForm";
import { paymentSchema } from "@/lib/validators/payment.schema";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

export default function FlowDrawer({ open, medicine, frequency, loading, error, onConfirm, onClose }) {
  const [step, setStep] = useState("review"); // review | payment
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState("");

  if (!open) return null;

  function handleClose() {
    setStep("review");
    setCard(EMPTY_CARD);
    setCardError("");
    onClose();
  }

  function handleContinue() {
    setStep("payment");
  }

  function handleConfirmWithCard() {
    const parsed = paymentSchema.safeParse(card);
    if (!parsed.success) {
      setCardError(parsed.error.issues[0]?.message || "Invalid card details");
      return;
    }
    setCardError("");
    onConfirm();
  }

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flow-drawer-title"
      >
        <div className="drawer-header">
          <h3 id="flow-drawer-title">
            {step === "review" ? "Confirm Auto-Refill" : "Payment Method"}
          </h3>
          <button type="button" className="drawer-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {step === "review" ? (
            <>
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
            </>
          ) : (
            <>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
                Add a payment method to charge automatically on each refill date.
              </p>
              <CardForm card={card} onChange={setCard} error={cardError || error} disabled={loading} />
            </>
          )}
        </div>

        <div className="drawer-footer">
          {step === "review" ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={loading}>
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setStep("review")} disabled={loading}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmWithCard} disabled={loading}>
                {loading ? "Confirming..." : "Confirm Subscription"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}