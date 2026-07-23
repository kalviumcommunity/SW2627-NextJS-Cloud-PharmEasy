"use client";

import { useCallback, useEffect, useState } from "react";

export function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load cart");
      setItems(data.items || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(medicineId, quantity = 1) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add item");
    await refresh();
    return data;
  }

  async function updateItem(itemId, quantity) {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update item");
    await refresh();
    return data;
  }

  async function removeItem(itemId) {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to remove item");
    }
    await refresh();
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.medicine.price, 0);

  return { items, loading, error, count, total, addItem, updateItem, removeItem, refresh };
}