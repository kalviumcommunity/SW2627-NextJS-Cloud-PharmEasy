"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const APP_NAV_ITEMS = [
  { label: "Home", href: "/home", icon: "🏠" },
  { label: "Medicines", href: "/medicines", icon: "💊" },
  { label: "Orders", href: "/orders", icon: "🚚" },
  { label: "Subscriptions", href: "/subscriptions", icon: "🔄" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export default function Navbar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link href={user ? "/home" : "/"} className="nav-logo-link">
            <img src="" alt="PharmEasy logo" className="nav-logo-icon" />
            PharmEasy
          </Link>
        </div>

        {/* Desktop links */}
        {user && (
          <nav className="nav-links nav-links--desktop">
            {APP_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "nav-link active" : "nav-link"}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="nav-right-actions nav-right-actions--desktop">
          {user ? (
            <>
              <span className="navbar-avatar" title={user.email}>
                {initial}
              </span>
              <button onClick={handleLogout} className="login-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="login-btn">
                Login
              </Link>
              <button
                onClick={() => router.push("/register")}
                className="btn btn-primary signup-btn"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {user ? (
            <>
              {APP_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={isActive(item.href) ? "nav-link active" : "nav-link"}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="login-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="login-btn" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/register");
                }}
                className="btn btn-primary signup-btn"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}