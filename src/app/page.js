import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import CategoryGrid from "@/components/marketing/CategoryGrid";
import MedicineGrid from "@/components/marketing/MedicineGrid";
import SubscriptionBanner from "@/components/marketing/SubscriptionBanner";
import HowItWorks from "@/components/marketing/HowItWorks";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import Testimonials from "@/components/marketing/Testimonials";
import FAQ from "@/components/marketing/FAQ";
import Newsletter from "@/components/marketing/Newsletter";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <SubscriptionBanner />
        <HowItWorks />
        <MedicineGrid />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
        <Newsletter />
      </main>
    </>
  );
}