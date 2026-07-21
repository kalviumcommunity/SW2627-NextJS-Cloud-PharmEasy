"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardForm from "@/components/checkout/CardForm";

const EMPTY_CARD = { cardName: "", cardNumber: "", expiry: "", cvv: "0000" };

/* Minimal line icons, drawn inline so no icon package is required. */
const ICONS = {
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.4" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h4" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 0 0-14.6-4.6M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.6 4.6M20 20v-5h-5" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.5h11v9h-11z" />
      <path d="M13.5 10h4l3 3v2.5h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9.2 9.3a2.8 2.8 0 1 1 4 2.5c-.9.5-1.4 1-1.4 2.1" />
      <circle cx="12" cy="16.6" r="0.15" fill="currentColor" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M16 16.5 21 12l-5-4.5" />
      <path d="M21 12H9" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
};

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
      icon: ICONS.pin,
      accent: "mint",
      label: "Saved addresses",
      sublabel: user.address ? "1 address on file" : "No address on file",
      expanded: addressOpen,
      onClick: () => setAddressOpen((v) => !v),
    },
    {
      key: "payments",
      icon: ICONS.card,
      accent: "amber",
      label: "Payment methods",
      sublabel: loadingCard
        ? "Loading..."
        : savedCard
        ? `•••• ${savedCard.last4}`
        : "No card saved",
      expanded: paymentOpen,
      onClick: () => setPaymentOpen((v) => !v),
    },
    {
      key: "subscriptions",
      icon: ICONS.refresh,
      accent: "blue",
      label: "My subscriptions",
      sublabel: `${subscriptionCount} subscription${subscriptionCount === 1 ? "" : "s"}`,
      external: true,
      onClick: () => router.push("/subscriptions"),
    },
    {
      key: "orders",
      icon: ICONS.truck,
      accent: "violet",
      label: "Order history",
      sublabel: `${orderCount} order${orderCount === 1 ? "" : "s"}`,
      external: true,
      onClick: () => router.push("/orders"),
    },
    {
      key: "help",
      icon: ICONS.help,
      accent: "slate",
      label: "Help & support",
      sublabel: "FAQs and contact",
      external: true,
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
        <div className="profile-summary-left">
          <div className="profile-avatar">{initial}</div>

          <div className="profile-summary-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-summary-stats">
          <div className="profile-summary-stat">
            <div className="profile-summary-stat-value">
              {subscriptionCount}
            </div>
            <div className="profile-summary-stat-label">
              Subscriptions
            </div>
          </div>

          <div className="profile-summary-stat">
            <div className="profile-summary-stat-value">
              {orderCount}
            </div>
            <div className="profile-summary-stat-label">
              Orders
            </div>
          </div>
        </div>
      </div>

        <div className="profile-row-list">
          {rows.map((row) => (
            <div key={row.key}>
              <button
                type="button"
                className={`profile-row${row.external ? " profile-row-external" : ""}`}
                onClick={row.onClick}
                aria-expanded={row.expanded ? "true" : "false"}
              >
                <span className={`profile-row-icon accent-${row.accent}`}>{row.icon}</span>
                <span className="profile-row-text">
                  <span className="profile-row-label">{row.label}</span>
                  <span className="profile-row-sublabel">{row.sublabel}</span>
                </span>
                <span className="profile-row-chevron">{ICONS.chevron}</span>
              </button>

              {row.key === "addresses" && (
                <div className={`profile-accordion${addressOpen ? " open" : ""}`}>
                  <div className="profile-accordion-inner">
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
                  </div>
                </div>
              )}

              {row.key === "payments" && (
                <div className={`profile-accordion${paymentOpen ? " open" : ""}`}>
                  <div className="profile-accordion-inner">
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
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            className="profile-row profile-row-danger"
            onClick={handleLogout}
          >
            <span className="profile-row-icon accent-red">{ICONS.logout}</span>
            <span className="profile-row-text">
              <span className="profile-row-label">Log out</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}