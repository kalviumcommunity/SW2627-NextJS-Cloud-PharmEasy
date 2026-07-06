import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      {/* Left Column: Premium Brand Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link href="/" className="auth-brand-logo" style={{ textDecoration: "none" }}>
            PharmEasy<span className="logo-dot"></span>
          </Link>
          
          <h2 className="auth-tagline">
            Your medicines.<br />
            Delivered automatically.
          </h2>
          
          <p style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: "16px", lineHeight: "1.6" }}>
            Set up an auto-refill schedule once, and we will take care of the rest. 
            Enjoy genuine products, fast delivery, and flexible subscriptions.
          </p>
          
          <div className="auth-features-list">
            <div className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              <span>100% Genuine Medicines</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              <span>Flexible Delivery Intervals</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-check">✓</span>
              <span>Pause or Cancel at Any Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Viewport */}
      <div className="auth-right">
        {children}
      </div>
    </div>
  );
}
