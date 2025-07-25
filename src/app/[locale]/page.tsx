import { AIColorizationGallery } from '@/components/home/ai-colorization-gallery';
import { ExperienceDifferenceSection } from '@/components/home/experience-difference-section';
import { FinalCTASection } from '@/components/home/final-cta-section';
import { HeroSection } from '@/components/home/hero-section';
import { HomeTestimonialsSection } from '@/components/home/testimonials-section';
// import { TrustedSection } from '@/components/home/trusted-section';

export default function Home() {
  return (
    <div
      className={`
      flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
      via-muted/25 to-background
    `}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Experience The Difference Section (moved up, right after Hero) */}
      <ExperienceDifferenceSection />

      {/* Home Testimonials Section */}
      <HomeTestimonialsSection />

      {/* AI Colorization Gallery */}
      <AIColorizationGallery />

      {/* Final CTA Section */}
      <FinalCTASection />
    </div>
  );
}
