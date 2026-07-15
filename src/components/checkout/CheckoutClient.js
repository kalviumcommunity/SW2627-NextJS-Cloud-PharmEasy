"use client";

import { useState } from "react";
import Link from "next/link";
import CardForm from "@/components/checkout/CardForm";
import { paymentSchema } from "@/lib/validators/payment.schema";
import { PAYMENT_STATUS } from "@/lib/utils/constants";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

export default function CheckoutClient({ medicine }) {
  const [quantity, setQuantity] = useState(1);
  const [card, setCard] = useState(EMPTY_CARD);
  const [step, setStep] = useState("review"); // review | result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [lastPaymentStatus, setLastPaymentStatus] = useState(null);

  const total = (medicine.price * quantity).toFixed(2);

  function updateQuantity(delta) {
    setQuantity((q) => Math.min(20, Math.max(1, q + delta)));
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");

    const parsedCard = paymentSchema.safeParse(card);
    if (!parsedCard.success) {
      setError(parsedCard.error.issues[0]?.message || "Invalid card details");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order (or reuse it, on retry).
      let currentOrder = order;
      if (!currentOrder) {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineId: medicine.id, quantity }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.message || "Failed to create order");
        }
        currentOrder = orderData;
        setOrder(orderData);
      }

      // 2. Attempt payment for real (random outcome, same engine the
      //    scheduler uses — not forced like the demo buttons).
      const payRes = await fetch(`/api/orders/${currentOrder.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCard.data),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.message || "Payment failed");
      }

      setOrder(payData.order);
      setLastPaymentStatus(payData.payment.status);
      setStep("result");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "result") {
    const success = lastPaymentStatus === PAYMENT_STATUS.SUCCESS;
    const permanentlyFailed = order?.status === "FAILED";

    return (
      <div className="checkout-result-card">
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>
          {success ? "✅" : permanentlyFailed ? "❌" : "⚠️"}
        </div>
        <h2 style={{ marginBottom: "8px" }}>
          {success
            ? "Payment Successful"
            : permanentlyFailed
            ? "Payment Failed"
            : "Payment Attempt Failed"}
        </h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          {success
            ? `Your order for ${quantity} × ${medicine.name} has been placed.`
            : permanentlyFailed
            ? "We couldn't process this payment after multiple attempts. The order has been cancelled."
            : "The simulated payment didn't go through. You can try again."}
        </p>

        <div className="drawer-summary-row">
          <span>Order ID</span>
          <strong>{order?.id?.substring(0, 8)}...</strong>
        </div>
        <div className="drawer-summary-row">
          <span>Amount</span>
          <strong>₹{total}</strong>
        </div>
        <div className="drawer-summary-row">
          <span>Status</span>
          <strong>{order?.status}</strong>
        </div>

        {error && <div className="auth-error-msg" style={{ marginTop: "16px" }}>{error}</div>}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {!success && !permanentlyFailed && (
            <button className="btn btn-primary" disabled={loading} onClick={handlePay}>
              {loading ? "Retrying..." : "Retry Payment"}
            </button>
          )}
          <Link href="/orders" style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary">View Order History</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-grid">
      <div className="checkout-summary-card">
        <h3 style={{ marginBottom: "16px" }}>Order Summary</h3>
        <div className="drawer-summary-row">
          <span>Medicine</span>
          <strong>{medicine.name}</strong>
        </div>
        <div className="drawer-summary-row">
          <span>Price</span>
          <strong>₹{medicine.price}</strong>
        </div>
        <div className="drawer-summary-row">
          <span>Quantity</span>
          <div className="quantity-stepper">
            <button type="button" onClick={() => updateQuantity(-1)} disabled={loading}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => updateQuantity(1)} disabled={loading}>
              +
            </button>
          </div>
        </div>
        <div className="drawer-summary-row" style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "12px", marginTop: "8px" }}>
          <span>Total</span>
          <strong style={{ fontSize: "20px", color: "var(--color-primary)" }}>₹{total}</strong>
        </div>
      </div>

      <form className="checkout-payment-card" onSubmit={handlePay}>
        <h3 style={{ marginBottom: "16px" }}>Payment Details</h3>
        <CardForm card={card} onChange={setCard} error={error} disabled={loading} />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 600, justifyContent: "center", marginTop: "8px" }}
        >
          {loading ? "Processing Payment..." : `Pay ₹${total}`}
        </button>
      </form>
    </div>
  );
}