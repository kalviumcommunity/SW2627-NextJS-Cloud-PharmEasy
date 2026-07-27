import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="main-section">
      <AppNavbar />
      <main className="content">{children}</main>

      <Footer />
    </div>
  );
}