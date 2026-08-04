import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import SubscriptionBanner from "@/components/landing/SubscriptionBanner";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SubscriptionBanner />
        <HowItWorks />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}