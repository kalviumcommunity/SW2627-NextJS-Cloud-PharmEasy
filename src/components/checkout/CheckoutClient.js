"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardForm from "@/components/checkout/CardForm";
import { paymentSchema } from "@/lib/validators/payment.schema";
import { PAYMENT_STATUS } from "@/lib/utils/constants";
import { useCart } from "@/hooks/useCart";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

export default function CheckoutClient({ mode = "single", medicine = null }) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [card, setCard] = useState(EMPTY_CARD);
  const [step, setStep] = useState("review"); // review | result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [lastPaymentStatus, setLastPaymentStatus] = useState(null);

  const [savedCard, setSavedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);

  const isCartMode = mode === "cart";

  const cartLines = isCartMode
    ? cart.items.map((i) => ({
        medicineId: i.medicine.id,
        name: i.medicine.name,
        price: i.medicine.price,
        quantity: i.quantity,
      }))
    : medicine
    ? [{ medicineId: medicine.id, name: medicine.name, price: medicine.price, quantity }]
    : [];

  const total = cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0).toFixed(2);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => setSavedCard(data.paymentMethod || null))
      .catch(() => {});
  }, []);

  function updateQuantity(delta) {
    setQuantity((q) => Math.min(20, Math.max(1, q + delta)));
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");

    if (isCartMode && cartLines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const cardToValidate =
      savedCard && !useNewCard
        ? {
            cardName: savedCard.cardHolderName,
            cardNumber: `0000000000000000`.slice(0, 12) + savedCard.last4,
            expiry: savedCard.expiry,
            cvv: card.cvv || "123",
          }
        : card;

    const parsedCard = paymentSchema.safeParse(cardToValidate);
    if (!parsedCard.success) {
      setError(parsedCard.error.issues[0]?.message || "Invalid card details");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order (or reuse it, on retry).
      let currentOrder = order;
      if (!currentOrder) {
        const orderBody = isCartMode
          ? { items: cartLines.map(({ medicineId, quantity }) => ({ medicineId, quantity })) }
          : { medicineId: medicine.id, quantity };

        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderBody),
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

      // Clear the cart only after a successful payment.
      if (isCartMode && payData.payment.status === PAYMENT_STATUS.SUCCESS) {
        for (const item of cart.items) {
          await cart.removeItem(item.id);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isCartMode && cart.loading) {
    return (
      <div className="meds-page-container">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (isCartMode && cartLines.length === 0 && step !== "result") {
    return (
      <div className="dashboard-section" style={{ textAlign: "center", padding: "60px 24px" }}>
        <h1 style={{ marginBottom: "16px" }}>Your Cart is Empty</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Add some medicines to your cart before checking out.
        </p>
        <Link href="/medicines" className="btn btn-primary">
          Browse Medicines
        </Link>
      </div>
    );
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
            ? isCartMode
              ? "Your order has been placed."
              : `Your order for ${quantity} × ${medicine.name} has been placed.`
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

        {isCartMode ? (
          cartLines.map((line) => (
            <div key={line.medicineId} className="drawer-summary-row">
              <span>{line.name} × {line.quantity}</span>
              <strong>₹{(line.price * line.quantity).toFixed(2)}</strong>
            </div>
          ))
        ) : (
          <>
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
          </>
        )}

        <div className="drawer-summary-row" style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "12px", marginTop: "8px" }}>
          <span>Total</span>
          <strong style={{ fontSize: "20px", color: "var(--color-primary)" }}>₹{total}</strong>
        </div>
      </div>

      <form className="checkout-payment-card" onSubmit={handlePay}>
        <h3 style={{ marginBottom: "16px" }}>Payment Details</h3>

        {savedCard && !useNewCard ? (
          <div className="card-form">
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>{savedCard.cardHolderName}</p>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
              •••• •••• •••• {savedCard.last4} · Expires {savedCard.expiry}
            </p>
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
          <CardForm card={card} onChange={setCard} error={error} disabled={loading} />
        )}

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