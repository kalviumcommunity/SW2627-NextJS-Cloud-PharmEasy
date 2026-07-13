import Sidebar from "@/components/app-shell/Sidebar";
import Topbar from "@/components/app-shell/Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <Topbar />
        <main className="content">{children}</main>

        <footer className="footer">
          <p>© 2026 PharmEasy. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}