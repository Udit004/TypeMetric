import Link from "next/link";

function FeatureCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href?: string;
  badge: string;
}) {
  const card = (
    <div className="group h-full rounded-3xl border border-sky-200/20 bg-slate-900/35 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-md flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-cyan-200/80">
            {badge}
          </p>
          <h3 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-200/90">
            {description}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-cyan-200/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100">
          {href ? "Explore" : "Built-in"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-1 text-xs text-slate-200/90">
          Real-time
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-1 text-xs text-slate-200/90">
          Precision
        </span>
        <span className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-1 text-xs text-slate-200/90">
          Progress
        </span>
      </div>

      <div className="mt-4 flex-1" />

      {href ? (
        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            {title}
            <span
              aria-hidden="true"
              className="text-cyan-200 transition group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );

  if (!href) return card;

  return <div>{card}</div>;
}

export function HomeFeaturesSection() {
  return (
    <section aria-label="Important features" className="mt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            Train smarter. Compete faster.
          </h2>
          <p className="mt-2 text-sm text-slate-200/90">
            Everything you need to practice, analyze, and improve—built for serious typing performance.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-3">
        <FeatureCard
          badge="MULTIPLAYER"
          title="Multiplayer racing"
          description="Join a room, race in real-time, and keep the competitive energy flowing with smooth live updates."
          href="/multiplayer"
        />
        <FeatureCard
          badge="LEADERBOARD"
          title="Leaderboards"
          description="See where you stand—ranked based on performance so progress is always measurable."
          href="/leaderboard"
        />
        <FeatureCard
          badge="ANALYTICS"
          title="Accuracy analytics"
          description="Track mistakes, timing patterns, and skill improvement with insights designed to reduce errors."
        />
      </div>
    </section>
  );
}
