"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }
    
    // Simulate API subscription
    setSubmitted(true);
    setMessage("Thank you for subscribing! Keep an eye on your inbox.");
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Stay Healthy</h2>
          <p className="newsletter-subtitle">
            Receive offers and health tips in your inbox.
          </p>
          
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (message) setMessage("");
              }}
              placeholder="Enter your email"
              disabled={submitted}
            />
            <button type="submit" className="btn btn-primary" disabled={submitted}>
              Subscribe
            </button>
          </form>
          
          {message && (
            <p
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: submitted ? "var(--color-primary)" : "#B84A3B",
                marginTop: "4px",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
