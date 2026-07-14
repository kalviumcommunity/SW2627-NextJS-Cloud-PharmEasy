import AppNavbar from "@/components/app-shell/AppNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="main-section">
      <AppNavbar />
      <main className="content">{children}</main>

      <footer className="footer">
        <p>© 2026 PharmEasy. All rights reserved.</p>
      </footer>
    </div>
  );
}