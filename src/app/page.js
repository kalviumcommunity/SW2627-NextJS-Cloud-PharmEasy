import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import SubscriptionBanner from "@/components/marketing/SubscriptionBanner";
import HowItWorks from "@/components/marketing/HowItWorks";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import Testimonials from "@/components/marketing/Testimonials";
import FAQ from "@/components/marketing/FAQ";

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
    </>
  );
}