"use client";

import { useState } from "react";

export function useSubscriptions(initialSubscriptions = []) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function patchSubscription(subscriptionId, body) {
    setLoadingId(subscriptionId);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update subscription");
      }

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subscriptionId ? data : sub))
      );

      return data;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      throw err;
    } finally {
      setLoadingId(null);
    }
  }

  async function updateStatus(subscriptionId, status) {
    return patchSubscription(subscriptionId, { status });
  }

  async function updateFrequency(subscriptionId, frequency) {
    return patchSubscription(subscriptionId, { frequency });
  }

  return { subscriptions, updateStatus, updateFrequency, loadingId, error };
}