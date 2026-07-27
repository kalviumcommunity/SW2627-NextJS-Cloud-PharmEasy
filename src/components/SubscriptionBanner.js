"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionBanner() {
  const router = useRouter();

  return (
    <section style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="container">
        <div className="sub-banner-card">
          {/* Left Column: Details */}
          <div className="sub-banner-content">
            <h2 className="sub-banner-title">
              Never miss your medicines<br />
              again.
            </h2>
            <p className="sub-banner-description">
              Set a schedule once. We'll automatically place your<br />
              orders — no reordering, no forgetting.
            </p>
            <div className="sub-banner-checks">
              <div className="sub-banner-check">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Daily
              </div>
              <div className="sub-banner-check">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Weekly
              </div>
              <div className="sub-banner-check">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Monthly
              </div>
            </div>
            
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={() => router.push("/register")}
                className="btn btn-primary"
              >
                Start Subscription
              </button>
            </div>
          </div>

          {/* Right Column: Illustration Graphic */}
          <div className="sub-banner-illustration">
            <div className="sub-illustration-container">
              <div className="sub-illustration-header">
                <span className="sub-illustration-dot"></span>
                <span className="sub-illustration-dot"></span>
              </div>
              <div className="sub-illustration-line"></div>
              
              <div className="sub-illustration-check-row">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "70%" }}>
                  <div style={{ height: "4px", backgroundColor: "#e2ddd3", width: "100%", borderRadius: "2px" }}></div>
                  <div style={{ height: "4px", backgroundColor: "#e2ddd3", width: "60%", borderRadius: "2px" }}></div>
                </div>
                <div className="sub-illustration-check-badge">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="sub-illustration-line"></div>
              <div style={{ height: "4px", backgroundColor: "#e2ddd3", width: "50%", borderRadius: "2px" }}></div>
              
              {/* Overlapping Floating Truck/Cart Container */}
              <div className="sub-illustration-truck">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ alignSelf: "center", marginTop: "4px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                
                <div className="sub-illustration-truck-wheels">
                  <span className="sub-illustration-wheel"></span>
                  <span className="sub-illustration-wheel"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
