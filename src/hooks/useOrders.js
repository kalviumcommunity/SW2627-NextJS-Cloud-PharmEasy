"use client";

import { useState } from "react";

export function useOrders(initialOrders = []) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function simulatePayment(orderId, outcome) {
    setLoadingId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/attempt-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to simulate payment");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: data.order.status } : order
        )
      );

      return data;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      throw err;
    } finally {
      setLoadingId(null);
    }
  }

  return { orders, simulatePayment, loadingId, error };
}