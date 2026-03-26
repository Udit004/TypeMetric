import { TypingInput } from "@/features/typing-engine/components/TypingInput";
import { Footer } from "@/share/components/footer";
import { Navbar } from "@/share/components/navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-14 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(circle_at_center,black_38%,transparent_80%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8 lg:py-14">
        <Navbar />

        <div className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-5">
          <TypingInput />
        </div>

        <Footer />
      </main>
    </div>
  );
}
