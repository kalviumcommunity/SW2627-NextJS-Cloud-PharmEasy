"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emoji = EMOJI_MAP[medicine.category?.toLowerCase()] || "💊";

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineId: medicine.id,
          frequency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create subscription");
        setLoading(false);
        return;
      }

      setSuccess("Subscription created successfully! Redirecting to Dashboard...");
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
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
        {/* Left Column: Image Box */}
        <div className="detail-img-box">
          {emoji}
        </div>

        {/* Right Column: Medicine details and Refill Selector */}
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

          {/* Subscription setup Form */}
          <form onSubmit={handleSubscribe} className="subscribe-config-card">
            <div className="subscribe-frequency-group">
              <label style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-text-main)" }}>
                Select Refill Frequency:
              </label>
              
              <div className="frequency-options">
                <div>
                  <input
                    type="radio"
                    id="freq-daily"
                    name="frequency"
                    value="DAILY"
                    className="frequency-radio"
                    checked={frequency === "DAILY"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  <label htmlFor="freq-daily" className="frequency-option-label">
                    Daily
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="freq-weekly"
                    name="frequency"
                    value="WEEKLY"
                    className="frequency-radio"
                    checked={frequency === "WEEKLY"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  <label htmlFor="freq-weekly" className="frequency-option-label">
                    Weekly
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="freq-monthly"
                    name="frequency"
                    value="MONTHLY"
                    className="frequency-radio"
                    checked={frequency === "MONTHLY"}
                    onChange={(e) => setFrequency(e.target.value)}
                  />
                  <label htmlFor="freq-monthly" className="frequency-option-label">
                    Monthly
                  </label>
                </div>
              </div>
            </div>

            {error && <div className="auth-error-msg">{error}</div>}
            {success && <div className="auth-success-msg">{success}</div>}

            {isLoggedIn ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", justifyContent: "center" }}
              >
                {loading ? "Creating Subscription..." : "Set Up Auto-Refill"}
              </button>
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
    </div>
  );
}
