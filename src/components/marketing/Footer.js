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
          <h4>Company</h4>
          <a href="/">About Us</a>
          <a href="/">Careers</a>
          <a href="/">Contact</a>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="/">Help Center</a>
          <a href="/">Track Order</a>
          <a href="/">Returns</a>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
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