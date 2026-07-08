"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: "🏠" },
  { label: "Orders", href: "/orders", icon: "🚚" },
  { label: "Subscriptions", href: "/subscriptions", icon: "🔄" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <aside className="sidebar">
      <h2>
        <span className="logo-dot" />
        PharmEasy
      </h2>

      <nav>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : ""}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="sidebar-logout-btn"
        onClick={handleLogout}
      >
        <span aria-hidden="true">🚪</span>
        Log out
      </button>
    </aside>
  );
}