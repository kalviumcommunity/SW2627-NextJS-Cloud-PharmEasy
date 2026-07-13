"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSuccess("");

    if (!token) {
      setMessage("Missing or invalid reset link");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "Password reset successful");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setMessage("Server not responding. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Set a New Password</h1>
        <p className="auth-subtitle">
          Choose a strong password for your account
        </p>
      </div>

      {!token ? (
        <div className="auth-error-msg">
          This reset link is invalid or has expired. Please request a new one.
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {message && <div className="auth-error-msg">{message}</div>}
          {success && <div className="auth-success-msg">{success}</div>}

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="new-password-input">
              New Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="new-password-input"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="confirm-password-input">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="confirm-password-input"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <div className="auth-footer">
        Back to <Link href="/login" className="auth-link">Log In</Link>
      </div>
    </div>
  );
}