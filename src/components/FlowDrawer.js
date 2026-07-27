"use client";

import { useEffect, useState } from "react";
import { FREQUENCY_LABEL } from "@/lib/utils";
import CardForm from "@/components/CardForm";
import { paymentSchema } from "@/lib/schemas";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

export default function FlowDrawer({ open, medicine, frequency, loading, error, onConfirm, onClose }) {
  const [step, setStep] = useState("review"); // review | payment
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState("");

  const [savedCard, setSavedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => setSavedCard(data.paymentMethod || null))
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  function handleClose() {
    setStep("review");
    setCard(EMPTY_CARD);
    setCardError("");
    setUseNewCard(false);
    onClose();
  }

  function handleContinue() {
    setStep("payment");
  }

  function handleConfirmWithCard() {
    const cardToValidate =
      savedCard && !useNewCard
        ? {
            cardName: savedCard.cardHolderName,
            cardNumber: `0000000000000000`.slice(0, 12) + savedCard.last4,
            expiry: savedCard.expiry,
            cvv: card.cvv || "123",
          }
        : card;

    const parsed = paymentSchema.safeParse(cardToValidate);
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
                This card will be charged automatically on each refill date.
              </p>

              {savedCard && !useNewCard ? (
                <div className="card-form">
                  <p style={{ fontWeight: 600, marginBottom: "4px" }}>{savedCard.cardHolderName}</p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
                    •••• •••• •••• {savedCard.last4} · Expires {savedCard.expiry}
                  </p>
                  {(cardError || error) && (
                    <div className="auth-error-msg">{cardError || error}</div>
                  )}
                  <button
                    type="button"
                    className="login-btn"
                    onClick={() => setUseNewCard(true)}
                    style={{ padding: 0 }}
                  >
                    Use a different card
                  </button>
                </div>
              ) : (
                <CardForm card={card} onChange={setCard} error={cardError || error} disabled={loading} />
              )}
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