import HeroSection from "@/features/homePage/components/heroSection";
import { TypingInputClient } from "@/features/typing-engine/components/TypingInputClient";
import { Footer } from "@/share/components/footer";
import { HomeFeaturesSection } from "@/features/homePage/components/HomeFeaturesSection";

export function HomePageContent() {
  return (
    <>
      {/* Keep typing experience at the top: hero -> typing -> features */}
      <HeroSection />

      <div className="rounded-3xl">
        <TypingInputClient />
      </div>

      <HomeFeaturesSection />

      <Footer />
    </>
  );
}
