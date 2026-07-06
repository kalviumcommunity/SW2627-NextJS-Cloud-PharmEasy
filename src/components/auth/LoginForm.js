"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
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
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Please enter your credentials to access your account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {message && <div className="auth-error-msg">{message}</div>}

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
              placeholder="••••••••"
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
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{" "}
        <Link href="/register" className="auth-link">
          Sign Up
        </Link>
      </div>
    </div>
  );
}