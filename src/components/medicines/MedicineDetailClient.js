"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FrequencySelector from "@/components/subscriptions/FrequencySelector";
import FlowDrawer from "@/components/subscriptions/FlowDrawer";
import DetailDrawer from "@/components/subscriptions/DetailDrawer";
import { subscriptionSchema } from "@/lib/validators/subscription.schema";

const EMOJI_MAP = {
  diabetes: "💉",
  hypertension: "🩹",
  thyroid: "💊",
  cardiac: "❤️",
  supplements: "🧃",
};

export default function MedicineDetailClient({ medicine, isLoggedIn }) {
  const router = useRouter();
  const [frequency, setFrequency] = useState("MONTHLY");
  const [flowOpen, setFlowOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emoji = EMOJI_MAP[medicine.category?.toLowerCase()] || "💊";

  function handleStartSubscribe(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setError("");
    setFlowOpen(true);
  }

  function handleBuyNow() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(`/checkout?medicineId=${medicine.id}`);
  }

  async function handleConfirmSubscribe() {
    const parsed = subscriptionSchema.safeParse({
      medicineId: medicine.id,
      frequency,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid subscription details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create subscription");
        setLoading(false);
        return;
      }

      setLoading(false);
      setFlowOpen(false);
      setSubscription(data);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  function handleCloseFlow() {
    if (loading) return;
    setFlowOpen(false);
    setError("");
  }

  return (
    <div className="meds-page-container">
      {/* Back Button */}
      <Link href="/medicines" style={{ textDecoration: "none", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontWeight: "600", fontSize: "15px" }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Medicines
      </Link>

      <div className="detail-grid">
        <div className="detail-img-box">
          {emoji}
        </div>

        <div className="detail-info-box">
          <div>
            <span className="badge badge-active" style={{ backgroundColor: "var(--bg-mint)", marginBottom: "12px" }}>
              {medicine.category}
            </span>
            <h1 style={{ fontSize: "36px", marginBottom: "12px" }}>{medicine.name}</h1>
            <div className="detail-price">₹{medicine.price}</div>
          </div>

          <div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Description</h3>
            <p style={{ lineHeight: "1.6" }}>{medicine.description || "No description available for this medicine."}</p>
          </div>

          <div style={{ display: "flex", gap: "24px", padding: "16px 0", borderTop: "1px solid var(--color-border-light)", borderBottom: "1px solid var(--color-border-light)" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>Availability</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a" }}>In Stock</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>Refill Plan</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>Auto-Refill Available</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>Source</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>Verified Pharmacy</div>
            </div>
          </div>

          <form onSubmit={handleStartSubscribe} className="subscribe-config-card">
            <FrequencySelector value={frequency} onChange={setFrequency} />

            {error && !flowOpen && <div className="auth-error-msg">{error}</div>}

            {isLoggedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn btn-secondary"
                  style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", justifyContent: "center" }}
                >
                  Buy Now
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", justifyContent: "center" }}
                >
                  Set Up Auto-Refill
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
                  You need to be logged in to set up an auto-refill subscription.
                </p>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <button className="btn btn-primary" type="button" style={{ width: "100%", justifyContent: "center" }}>
                    Log In to Subscribe
                  </button>
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>

      <FlowDrawer
        open={flowOpen}
        medicine={medicine}
        frequency={frequency}
        loading={loading}
        error={error}
        onConfirm={handleConfirmSubscribe}
        onClose={handleCloseFlow}
      />

      <DetailDrawer
        open={!!subscription}
        subscription={subscription}
        onClose={() => setSubscription(null)}
      />
    </div>
  );
}