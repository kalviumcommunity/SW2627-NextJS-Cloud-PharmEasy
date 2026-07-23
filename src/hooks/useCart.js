"use client";

import { useCallback, useEffect, useState } from "react";

export function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(medicineId, quantity = 1) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId, quantity }),
    });
    await refresh();
  }

  async function updateItem(itemId, quantity) {
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await refresh();
  }

  async function removeItem(itemId) {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await refresh();
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.medicine.price, 0);

  return { items, loading, count, total, addItem, updateItem, removeItem, refresh };
}