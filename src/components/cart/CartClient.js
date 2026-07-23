"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

export default function CartClient() {
  const router = useRouter();
  const { items, loading, total, updateItem, removeItem } = useCart();

  function handleQuantityChange(itemId, currentQty, delta) {
    const next = Math.min(20, Math.max(1, currentQty + delta));
    if (next !== currentQty) updateItem(itemId, next);
  }

  if (loading) {
    return (
      <div className="meds-page-container">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="meds-page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Browse medicines and add items to your cart to see them here.</p>
          <Link href="/medicines" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary" style={{ marginTop: "16px" }}>
              Browse Medicines
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="meds-page-container">
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>Your Cart</h1>

      <div className="checkout-grid">
        <div className="checkout-summary-card">
          {items.map((item) => (
            <div
              key={item.id}
              className="drawer-summary-row"
              style={{ alignItems: "center", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid var(--color-border-light)" }}
            >
              <div>
                <strong>{item.medicine.name}</strong>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>₹{item.medicine.price} each</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div className="quantity-stepper">
                  <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity, 1)}>
                    +
                  </button>
                </div>

                <strong>₹{(item.medicine.price * item.quantity).toFixed(2)}</strong>

                <button
                  type="button"
                  className="login-btn"
                  onClick={() => removeItem(item.id)}
                  style={{ padding: 0, color: "#dc2626" }}
                  aria-label={`Remove ${item.medicine.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="drawer-summary-row" style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "12px", marginTop: "8px" }}>
            <span>Total</span>
            <strong style={{ fontSize: "20px", color: "var(--color-primary)" }}>₹{total.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 600, justifyContent: "center", marginTop: "16px" }}
            onClick={() => router.push("/checkout?fromCart=1")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}