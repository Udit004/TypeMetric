import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Master Your <span className="text-cyan-400">Typing Speed</span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Build elite typing speed with a distraction-free engine, precise WPM tracking,
          and instant accuracy insights designed for serious performance training.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/typing-test"
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        >
          Start Typing Test
        </Link>
        <Link
          href="/multiplayer"
          className="inline-flex items-center justify-center rounded-2xl border border-sky-200/20 bg-slate-900/45 px-6 py-3 font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-slate-800/60 hover:text-white"
        >
          Multiplayer Race
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-300 sm:text-sm pt-4">
        <div className="rounded-2xl border border-sky-200/10 bg-slate-900/45 px-4 py-3 backdrop-blur-sm shadow-sm">
          Real-time feedback loop
        </div>
        <div className="rounded-2xl border border-sky-200/10 bg-slate-900/45 px-4 py-3 backdrop-blur-sm shadow-sm">
          Session-grade analytics
        </div>
        <div className="rounded-2xl border border-sky-200/10 bg-slate-900/45 px-4 py-3 backdrop-blur-sm shadow-sm">
          Clean keyboard-first workflow
        </div>
      </div>
    </section>
  );
}
