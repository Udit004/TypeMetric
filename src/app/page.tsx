import Image from "next/image";
import { TypingInput } from "@/features/typing-engine/components/TypingInput";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-14 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(circle_at_center,black_38%,transparent_80%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-8 lg:py-14">
        <section className="mb-8 flex flex-col gap-5 lg:mb-10">
          <span className="inline-flex w-fit items-center rounded-full border border-cyan-300/35 bg-cyan-100/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Pro Typing Platform
          </span>

          <div className="space-y-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src="/assests/images/logo.png"
                  alt="TypeMetric logo"
                  width={64}
                  height={64}
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                  priority
                />
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  TypeMetric
                </h1>
              </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
              Build elite typing speed with a distraction-free engine, precise WPM tracking,
              and instant accuracy insights designed for serious performance training.
            </p>
          </div>

          <div className="grid gap-3 text-xs text-slate-200 sm:grid-cols-3 sm:text-sm">
            <div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
              Real-time feedback loop
            </div>
            <div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
              Session-grade analytics
            </div>
            <div className="rounded-2xl border border-sky-200/20 bg-slate-900/45 px-4 py-3 backdrop-blur-sm">
              Clean keyboard-first workflow
            </div>
          </div>
        </section>

        <div className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-3 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-5">
          <TypingInput />
        </div>
      </main>
    </div>
  );
}
