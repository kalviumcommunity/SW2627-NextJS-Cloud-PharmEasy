"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: "🏠" },
  { label: "Medicines", href: "/medicines", icon: "💊" },
  { label: "Orders", href: "/orders", icon: "🚚" },
  { label: "Subscriptions", href: "/subscriptions", icon: "🔄" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
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
      } catch (err) {}
    }
    loadUnreadCount();
    return () => { cancelled = true; };
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/medicines?q=${encodeURIComponent(trimmed)}` : "/medicines");
    setMobileOpen(false);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-row">
        <Link href="/home" className="app-navbar-logo">
  <svg
    width="40"
    height="16"
    viewBox="0 0 280 100"
    xmlns="http://www.w3.org/2000/svg"
    className="app-navbar-logo-icon"
  >
    <path
      d="M 0 50 A 45 45 0 0 1 45 5 H 140 A 45 45 0 0 1 140 95 H 45 A 45 45 0 0 1 0 50 Z"
      fill="#f3ecdc"
    />
    <path
      d="M 140 5 H 235 A 45 45 0 0 1 235 95 H 140 Z"
      fill="#c98a3e"
    />
  </svg>
  PharmEasy
</Link>

        <nav className="app-navbar-links">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={isActive ? "app-nav-link active" : "app-nav-link"}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form className="app-navbar-search" onSubmit={handleSearchSubmit} role="search">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search medicines"
          />
        </form>

        <Link href="/notifications" className="app-navbar-bell" aria-label="Notifications">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && <span className="app-navbar-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </Link>

        <button type="button" className="app-navbar-logout" onClick={handleLogout}>
          <span aria-hidden="true">🚪</span>
          Log out
        </button>

        <button
          className="app-navbar-hamburger"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>
      </div>

      {mobileOpen && (
        <div className="app-navbar-mobile-menu">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={isActive ? "app-nav-link active" : "app-nav-link"}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <form className="app-navbar-search" onSubmit={handleSearchSubmit} role="search">
            <input
              type="text"
              placeholder="Search medicines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search medicines"
            />
          </form>
          <button type="button" className="app-navbar-logout" onClick={handleLogout}>
            <span aria-hidden="true">🚪</span>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}