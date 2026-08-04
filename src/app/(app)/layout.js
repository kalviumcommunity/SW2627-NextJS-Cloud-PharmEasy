import AppNavbar from "@/components/layout/AppNavbar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="main-section">
      <AppNavbar />
      <main className="content">{children}</main>

      <Footer />
    </div>
  );
}