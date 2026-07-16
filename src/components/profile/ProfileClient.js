"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardForm from "@/components/checkout/CardForm";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "0000" };

export default function ProfileClient({ user, subscriptionCount, orderCount }) {
  const router = useRouter();

  const [address, setAddress] = useState(user.address || "");
  const [addressOpen, setAddressOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [savedCard, setSavedCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [editingCard, setEditingCard] = useState(false);
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState("");
  const [savingCard, setSavingCard] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);

  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  useEffect(() => {
    async function loadSavedCard() {
      try {
        const res = await fetch("/api/payment-methods");
        const data = await res.json();
        setSavedCard(data.paymentMethod || null);
      } catch (err) {
        // silently ignore - the section just shows "no card saved"
      } finally {
        setLoadingCard(false);
      }
    }
    loadSavedCard();
  }, []);

  async function handleSaveAddress() {
    setSavingAddress(true);
    setAddressSaved(false);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (res.ok) {
        setAddressSaved(true);
        setTimeout(() => setAddressSaved(false), 2000);
      } else {
        alert("Could not save address. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with server");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSaveCard(e) {
    e.preventDefault();
    setCardError("");
    setSavingCard(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: card.cardName,
          cardNumber: card.cardNumber,
          expiry: card.expiry,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save card");
      }
      setSavedCard(data.paymentMethod);
      setEditingCard(false);
      setCard(EMPTY_CARD);
    } catch (err) {
      setCardError(err.message);
    } finally {
      setSavingCard(false);
    }
  }

  async function handleRemoveCard() {
    setRemovingCard(true);
    try {
      await fetch("/api/payment-methods", { method: "DELETE" });
      setSavedCard(null);
    } catch (err) {
      alert("Could not remove card. Please try again.");
    } finally {
      setRemovingCard(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  const rows = [
    {
      key: "addresses",
      icon: "📍",
      label: "Saved addresses",
      sublabel: user.address ? "1 address on file" : "No address on file",
      onClick: () => setAddressOpen((v) => !v),
    },
    {
      key: "payments",
      icon: "💳",
      label: "Payment methods",
      sublabel: loadingCard
        ? "Loading..."
        : savedCard
        ? `•••• ${savedCard.last4}`
        : "No card saved",
      onClick: () => setPaymentOpen((v) => !v),
    },
    {
      key: "subscriptions",
      icon: "🔄",
      label: "My subscriptions",
      sublabel: `${subscriptionCount} subscription${subscriptionCount === 1 ? "" : "s"}`,
      onClick: () => router.push("/subscriptions"),
    },
    {
      key: "orders",
      icon: "🚚",
      label: "Order history",
      sublabel: `${orderCount} order${orderCount === 1 ? "" : "s"}`,
      onClick: () => router.push("/orders"),
    },
    {
      key: "help",
      icon: "❓",
      label: "Help & support",
      sublabel: "FAQs and contact",
      onClick: () => router.push("/profile#help"),
    },
  ];

  return (
    <div className="profile-page">
      <div className="dashboard-header">
        <h1>Profile</h1>
        <p>Account, payment, and delivery settings.</p>
      </div>

      <div className="profile-card">
        <div className="profile-summary">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-summary-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-row-list">
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              className="profile-row"
              onClick={row.onClick}
            >
              <span className="profile-row-icon">{row.icon}</span>
              <span className="profile-row-text">
                <span className="profile-row-label">{row.label}</span>
                <span className="profile-row-sublabel">{row.sublabel}</span>
              </span>
              <span className="profile-row-chevron">›</span>
            </button>
          ))}

          {addressOpen && (
            <div className="profile-address-editor">
              <label className="auth-form-label" htmlFor="address">
                Shipping address
              </label>
              <textarea
                id="address"
                className="auth-input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Add your delivery address"
              />
              <div className="profile-address-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                >
                  {savingAddress ? "Saving..." : "Save address"}
                </button>
                {addressSaved && (
                  <span className="profile-saved-tick">Saved ✓</span>
                )}
              </div>
            </div>
          )}

          {paymentOpen && (
            <div className="profile-address-editor">
              {!editingCard && savedCard && (
                <>
                  <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                    {savedCard.cardHolderName}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
                    •••• •••• •••• {savedCard.last4} &nbsp;·&nbsp; Expires {savedCard.expiry}
                  </p>
                  <div className="profile-address-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingCard(true)}
                    >
                      Replace card
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={handleRemoveCard}
                      disabled={removingCard}
                    >
                      {removingCard ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </>
              )}

              {!editingCard && !savedCard && !loadingCard && (
                <>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
                    No card saved yet. Save one so checkout is faster next time.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setEditingCard(true)}
                  >
                    Add a card
                  </button>
                </>
              )}

              {editingCard && (
                <form onSubmit={handleSaveCard}>
                  <CardForm card={card} onChange={setCard} error={cardError} disabled={savingCard} />
                  <div className="profile-address-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingCard}>
                      {savingCard ? "Saving..." : "Save card"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingCard(false);
                        setCard(EMPTY_CARD);
                        setCardError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <button
            type="button"
            className="profile-row profile-row-danger"
            onClick={handleLogout}
          >
            <span className="profile-row-icon">🚪</span>
            <span className="profile-row-text">
              <span className="profile-row-label">Log out</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}