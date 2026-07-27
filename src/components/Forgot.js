"use client";

import { useState } from "react";
import Link from "next/link";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSuccess("");

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to send reset link");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "Reset link sent to your email");
      setEmail("");
    } catch (err) {
      setMessage("Server not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your registered email and we'll send you a reset link
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {message && <div className="auth-error-msg">{message}</div>}
        {success && <div className="auth-success-msg">{success}</div>}

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

        <button
          className="btn btn-primary auth-submit-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="auth-footer">
        Remembered your password?{" "}
        <Link href="/login" className="auth-link">
          Log In
        </Link>
      </div>
    </div>
  );
}