export default function HeroSection() {
  return (
    <section className="mb-6 space-y-4 lg:mb-8">
      <p className="max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
        Build elite typing speed with a distraction-free engine, precise WPM tracking,
        and instant accuracy insights designed for serious performance training.
      </p>

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
  );
}
