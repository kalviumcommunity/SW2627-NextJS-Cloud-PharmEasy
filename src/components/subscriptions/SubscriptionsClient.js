"use client";

import Link from "next/link";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";

export default function SubscriptionsClient({ initialSubscriptions }) {
  const { subscriptions, updateStatus, updateFrequency, loadingId, error } = useSubscriptions(initialSubscriptions);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Your Subscriptions</h1>
        <p>Configure auto-refill frequency, pause active plans, or update delivery schedules.</p>
      </div>

      <div className="dashboard-section">
        <div className="section-title-area">
          <h2 className="section-title">All Subscriptions</h2>
          <Link href="/medicines" className="btn btn-primary btn-sm">
            + Add Subscription
          </Link>
        </div>

        {error && (
          <p style={{ color: "#dc2626", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h4>No Subscriptions Yet</h4>
            <p>Browse our catalog and set up auto-refills for medicines you take regularly.</p>
            <Link href="/medicines" className="btn btn-primary" style={{ marginTop: "12px" }}>
              Browse Medicines
            </Link>
          </div>
        ) : (
          <div className="sub-list">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                loading={loadingId === sub.id}
                onUpdateStatus={(status) => updateStatus(sub.id, status)}
                onUpdateFrequency={(frequency) => updateFrequency(sub.id, frequency)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}