import { AIColorizationGallery } from '@/components/home/ai-colorization-gallery';
import { ExperienceDifferenceSection } from '@/components/home/experience-difference-section';
import { FinalCTASection } from '@/components/home/final-cta-section';
import { HeroSection } from '@/components/home/hero-section';
import { HomeTestimonialsSection } from '@/components/home/testimonials-section';
import { TrustedSection } from '@/components/home/trusted-section';

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

      {/* Trusted Section */}
      <TrustedSection />

      {/* Experience The Difference Section */}
      <ExperienceDifferenceSection />

      {/* Home Testimonials Section */}
      <HomeTestimonialsSection />

      {/* AI Colorization Gallery */}
      <AIColorizationGallery />

      {/* Final CTA Section */}
      <FinalCTASection />
    </div>
    // <div className="flex h-screen flex-col items-center justify-center">
    //   <div className="mb-9 flex flex-col items-center gap-4">
    //     <Button color="primary">Button</Button>

  //     <div className="flex gap-4">
  //       <Link href="/" className="text-blue-500 hover:underline">
  //         Home
  //       </Link>
  //       <Link href="/pathnames" className="text-blue-500 hover:underline">
  //         Pathnames
  //       </Link>
  //     </div>

  //     <LanguageSwitcher />
  //   </div>

  //   <div className="max-w-4xl text-center">
  //     <p className="text-lg">{t('desc')}</p>
  //   </div>
  // </div>
  );
}
