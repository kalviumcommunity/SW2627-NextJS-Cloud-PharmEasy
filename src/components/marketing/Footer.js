import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <div className="footer-logo">PharmEasy</div>
          <p className="footer-tagline">
            Medicines delivered on time, every time.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/medicines">Medicines</Link>
          <Link href="/subscriptions">Subscriptions</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link href="/login">Log In</Link>
          <Link href="/register">Sign Up</Link>
          <Link href="/orders">Track Order</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} PharmEasy. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}