import HeroSection from "@/features/homePage/components/heroSection";
import { HomeDemoSection } from "@/features/homePage/components/HomeDemoSection";
import { Footer } from "@/share/components/footer";
import { HomeFeaturesSection } from "@/features/homePage/components/HomeFeaturesSection";
import { BackgroundParticles } from "@/features/homePage/components/BackgroundParticles";

export function HomePageContent() {
  return (
    <div className="relative">
      <BackgroundParticles />

      {/* Hero and Demo Side by Side */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-6  md:mt-16 mb-38">
        <HeroSection />
        <HomeDemoSection />
      </div>

      <div className="relative z-10">
        <HomeFeaturesSection />
        <Footer />
      </div>
    </div>
  );
}
