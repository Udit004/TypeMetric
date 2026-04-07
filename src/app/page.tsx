import HeroSection from "@/features/homePage/components/heroSection";
import { TypingInputClient } from "@/features/typing-engine/components/TypingInputClient";
import { Footer } from "@/share/components/footer";

export default function Home() {
  return (
    <>
      <HeroSection />

      <div className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-5">
        <TypingInputClient />
      </div>

      <Footer />
    </>
  );
}
