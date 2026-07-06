"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!name || !email || !password) {
      setMessage("Please fill all the fields");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      router.push("/home");
    } catch (err) {
      setMessage("Server not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to schedule and automate your medicine refills</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {message && <div className="auth-error-msg">{message}</div>}

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="name-input">
            Full Name
          </label>
          <div className="auth-input-wrapper">
            <input
              id="name-input"
              className="auth-input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="email-input">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="email-input"
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="password-input">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="password-input"
              className="auth-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary auth-submit-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Log In
        </Link>
      </div>
    </div>
  );
}