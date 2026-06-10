import Link from "next/link";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-sky-200/20 bg-slate-900/35 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-md">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-200/90">
        {children}
      </div>
    </div>
  );
}

function BulletGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200/92"
        >
          <span className="font-semibold text-white/90">•</span> {item}
        </li>
      ))}
    </ul>
  );
}

export function AboutPageContent() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6 rounded-3xl border border-sky-200/20 bg-slate-900/35 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-md sm:p-8">
        <p className="text-xs font-bold tracking-widest text-cyan-200/80">
          ABOUT TYPEMETRIC
        </p>

        <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          A precision typing platform for speed, accuracy, and progress.
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-200/90 sm:text-base">
          TypeMetric helps you measure typing performance in real time, analyze
          mistakes, and improve your results with session-grade analytics.
          Whether you’re learning touch typing or optimizing productivity,
          TypeMetric keeps your progress visible and actionable.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/multiplayer"
            className="inline-flex items-center rounded-xl border border-cyan-200/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Multiplayer racing →
          </Link>

          <Link
            href="/leaderboard"
            className="inline-flex items-center rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/40"
          >
            View leaderboards →
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Who it&apos;s for">
          TypeMetric is built for every level:
          <div className="mt-3">
            <ul className="list-disc pl-5 text-sm text-slate-200/90">
              <li>Beginners learning touch typing</li>
              <li>Students and professionals benchmarking performance</li>
              <li>Competitive typists who enjoy multiplayer challenges</li>
              <li>Developers who want measurable accuracy and consistency</li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="Core features">
          <BulletGrid
            items={[
              "Real-time WPM & accuracy with low-latency updates",
              "Per-character mistake analysis and error insights",
              "Session history and progress charts",
              "Multiplayer rooms and ranked leaderboards",
              "Curated practice drills to target weak areas",
              "Shareable results and challenge links",
            ]}
          />
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SectionCard title="How it works">
          TypeMetric captures keystrokes during a session and calculates
          words-per-minute (WPM) and accuracy with high precision. Results are
          then aggregated into reports and visualized so you can spot patterns,
          identify recurring errors, and focus practice where it matters most.
        </SectionCard>

        <SectionCard title="Privacy &amp; data">
          We take privacy seriously. Session data (results, timestamps, and
          analytics) is stored to provide history and leaderboards. We do not
          sell personal data. If you have questions about data retention or
          removal, contact us through the site.
        </SectionCard>
      </div>

      <div className="mt-4 rounded-3xl border border-sky-200/20 bg-slate-900/35 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-md">
        <h2 className="text-xl font-extrabold text-white">Get started</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-200/90">
          Start a typing test from the home page, then explore multiplayer
          rooms and ranked leaderboards. Use analytics to see how your
          accuracy changes over time—and adjust your practice for faster,
          cleaner results.
        </p>
      </div>
    </div>
  );
}
