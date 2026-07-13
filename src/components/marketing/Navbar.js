"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Left Side: Brand Logo */}
        <Link href="/" className="nav-logo-link">
          <svg
            width="38"
            height="38"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="nav-logo-icon"
          >
            <g transform="translate(100,100) rotate(-18)">
              <path
                d="M 0 -26 H -46 A 26 26 0 0 0 -72 0 A 26 26 0 0 0 -46 26 H 0 Z"
                fill="#f3ecdc"
              />
              <path
                d="M 0 -26 H 46 A 26 26 0 0 1 72 0 A 26 26 0 0 1 46 26 H 0 Z"
                fill="#c98a3e"
              />
            </g>
          </svg>
          PharmEasy
        </Link>

        {/* Right Side: Authentication Actions */}
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