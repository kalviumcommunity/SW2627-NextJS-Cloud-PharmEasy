"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link href="/" className="nav-logo-link">
            <svg
              width="46"
              height="19"
              viewBox="0 0 280 100"
              xmlns="http://www.w3.org/2000/svg"
              className="nav-logo-icon"
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
        </div>

        <div className="nav-right-actions">
          <Link href="/login" className="login-btn">
            Login
          </Link>
          <button
            onClick={() => router.push("/register")}
            className="btn btn-primary signup-btn"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}