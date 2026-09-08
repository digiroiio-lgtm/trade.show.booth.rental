import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ServicesGrid from "@/components/ServicesGrid";
import LocationsGrid from "@/components/LocationsGrid";
import TrustSection from "@/components/TrustSection";

export const metadata: Metadata = {
  title: "Compare Trade Show Booth Builders. Get 3 Quotes.",
  description:
    "Compare trade show booth builders and get up to 3 quotes from US exhibit companies. Free to compare, no obligation, one project brief.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ServicesGrid />
      <LocationsGrid />
      <TrustSection />
    </>
  );
}
