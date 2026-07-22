import AppNavbar from "@/components/app-shell/AppNavbar";
import Footer from "@/components/marketing/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="main-section">
      <AppNavbar />
      <main className="content">{children}</main>

      <Footer />
    </div>
  );
}