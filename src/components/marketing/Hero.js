"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="hero">
      <div className="container hero-grid">
        {/* Left Column: Copy & Interactive Elements */}
        <div className="hero-content">
          <div className="hero-badge">
            <span style={{ width: "24px", height: "2px", backgroundColor: "var(--color-primary)" }}></span>
            Trusted Online Pharmacy
          </div>
          
          <h1 className="hero-title">
            Medicines delivered on<br />
            time, every time.
          </h1>
          
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
          
          <div className="hero-ticks">
            <div className="hero-tick-item">
              <span className="hero-tick-icon">✓</span> Genuine Medicines
            </div>
            <div className="hero-tick-item">
              <span className="hero-tick-icon">✓</span> Fast Delivery
            </div>
            <div className="hero-tick-item">
              <span className="hero-tick-icon">✓</span> Licensed Pharmacy
            </div>
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
        </div>

        {/* Right Column: Visual Graphic (Matching the mockup) */}
        <div className="hero-illustration">
          <div className="hero-circle-bg">
            {/* Orange Checkmark Badge */}
            <div className="hero-badge-check">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Premium Pill Vector Graphic */}
            <svg
              className="hero-vector-capsule"
              width="150"
              height="80"
              viewBox="0 0 150 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Pill outline */}
              <rect
                x="4"
                y="4"
                width="142"
                height="72"
                rx="36"
                stroke="var(--color-primary)"
                strokeWidth="6"
                fill="white"
              />
              {/* Colored half of the capsule */}
              <path
                d="M75 4C94.8823 4 110 19.1177 110 39C110 58.8823 94.8823 76 75 76V4Z"
                fill="var(--color-primary)"
                transform="translate(36, 0)"
              />
              {/* Divider line in center */}
              <line
                x1="75"
                y1="4"
                x2="75"
                y2="76"
                stroke="var(--color-primary)"
                strokeWidth="6"
              />
            </svg>

            {/* Refill Card Vector */}
            <div className="hero-vector-card">
              <div className="hero-card-line-top">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="hero-card-line-bottom"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
