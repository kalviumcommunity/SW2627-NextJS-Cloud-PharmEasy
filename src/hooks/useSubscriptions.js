"use client";

import { useState } from "react";

export function useSubscriptions(initialSubscriptions = []) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function updateStatus(subscriptionId, status) {
    setLoadingId(subscriptionId);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  return { subscriptions, updateStatus, loadingId, error };
}