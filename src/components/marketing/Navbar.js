"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Left Side: Brand Logo */}
        <div className="nav-left">
          <Link href="/" className="nav-logo-link">
            <img
              src=""
              alt="PharmEasy logo"
              className="nav-logo-icon"
            />
            PharmEasy
          </Link>
        </div>

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