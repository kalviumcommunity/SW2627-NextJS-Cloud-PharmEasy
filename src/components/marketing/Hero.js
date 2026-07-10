"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="hero">
      <div className="hero-glow" />

      {/* Large faint watermark — a mortar & pestle motif, the classic
          pharmacy symbol, sitting quietly behind the centered copy. */}
      {/* Tiled background pattern — a repeating grid of pharmacy icons,
          like Netflix's poster wall, with a scrim so the centered text
          stays readable. */}
      <div className="hero-tile-pattern" />
      <div className="hero-scrim" />
      
      <div className="container hero-grid">
        <div className="hero-badge">
          <span className="hero-badge-dash"></span>
          Trusted Online Pharmacy
        </div>

        <h1 className="hero-title">
          Medicines delivered
          <br />
          on time, <em>every time.</em>
        </h1>

        <p className="hero-subtitle">
          Set your refill once — we track the schedule, confirm payment,
          and have it at your door before the last dose runs out.
        </p>

        <div className="hero-search-container">
          <div className="search-wrapper">
            <svg
              className="search-icon-inline"
              width="20"
              height="20"
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
            <input
              type="text"
              placeholder="Search for medicines, wellness, healthcare products"
            />
          </div>
          <button className="btn btn-primary" style={{ padding: "0 32px" }}>
            Search
          </button>
        </div>

        <div className="hero-buttons">
          <button
            onClick={() => router.push("/register")}
            className="btn btn-primary"
          >
            Start Subscription
          </button>
          <button
            onClick={() => router.push("/medicines")}
            className="btn btn-secondary"
          >
            Browse Medicines
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-number">50,000+</span>
            <span className="hero-stat-label">Orders Delivered</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="hero-stat-number">4.8★</span>
            <span className="hero-stat-label">Average Rating</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat-item">
            <span className="hero-stat-number">500+</span>
            <span className="hero-stat-label">Medicines In Stock</span>
          </div>
        </div>
      </div>
    </section>
  );
}