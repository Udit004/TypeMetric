import HeroSection from "@/features/homePage/components/heroSection";
import { TypingInput } from "@/features/typing-engine/components/TypingInput";
import { Footer } from "@/share/components/footer";
import { Navbar } from "@/share/components/navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8 lg:py-14">
        <Navbar />

        <HeroSection />

        <div className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-5">
          <TypingInput />
        </div>

        <Footer />
      </main>
    </div>
  );
}
