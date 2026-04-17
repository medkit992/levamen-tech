import Hero from "../components/sections/Hero";
import PricingPreview from "../components/pricing/PricingPreview";

export default function Home() {
  return (
    <>
      <Hero
        eyebrow="Premium websites for service businesses"
        title="Custom websites with a sunset-to-sea feel"
        gradientWord="sunset-to-sea"
        description="Levamen Tech builds modern, high-converting websites for businesses that want something cleaner, faster, and more memorable than a template."
        primaryCtaText="View Demos"
        primaryCtaTo="/demos"
        secondaryCtaText="Get in Touch"
        secondaryCtaTo="/contact"
      />

      <PricingPreview />
    </>
  );
}