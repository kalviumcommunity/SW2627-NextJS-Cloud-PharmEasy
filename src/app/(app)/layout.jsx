import Sidebar from "@/components/app-shell/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <main className="content">{children}</main>

        <footer className="footer">
          <p>© 2026 PharmEasy. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}