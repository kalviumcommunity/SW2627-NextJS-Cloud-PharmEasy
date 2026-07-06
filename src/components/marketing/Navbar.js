"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit}>
      <h1>Create your account</h1>
      <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {message && <p style={{ color: "#B84A3B" }}>{message}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}