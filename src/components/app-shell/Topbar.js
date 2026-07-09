"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (err) {
        // Silently ignore - the bell just renders without a badge.
      }
    }

    loadUnreadCount();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/medicines?q=${encodeURIComponent(trimmed)}` : "/medicines");
  }

  return (
    <header className="topbar">
      <form className="topbar-search-bar" onSubmit={handleSearchSubmit} role="search">
        <svg
          className="nav-search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search medicines..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search medicines"
        />
      </form>

      <Link href="/notifications" className="topbar-bell" aria-label="Notifications">
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="topbar-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </Link>
    </header>
  );
}