"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Left Side: Brand Logo and Main Links */}
        <div className="nav-left">
          <Link href="/" className="nav-logo-link">
            PharmEasy<span className="logo-dot"></span>
          </Link>
          
          <nav className="nav-links">
            <Link href="/medicines" className="nav-link">
              Medicines
            </Link>
            <Link href="/healthcare" className="nav-link">
              Healthcare
            </Link>
            <Link href="/subscriptions" className="nav-link">
              Subscriptions
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </nav>
        </div>

        {/* Right Side: Search and Authentication Actions */}
        <div className="nav-right-actions">
          <div className="nav-search-bar">
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
            <input type="text" placeholder="Search medicines" />
          </div>

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