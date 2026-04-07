import { ProfileDashboard } from "../types";
import { metric } from "./profileFormatters";

interface ProfileStatsGridProps {
  profile: ProfileDashboard;
}

export function ProfileStatsGrid({ profile }: ProfileStatsGridProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Performance Snapshot</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Solo Sessions</p><p className="mt-3 text-2xl font-black text-white">{profile.typingStats.sessionsCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Best Solo WPM</p><p className="mt-3 text-2xl font-black text-cyan-200">{metric(profile.typingStats.bestWpm)}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Avg Solo Accuracy</p><p className="mt-3 text-2xl font-black text-emerald-200">{metric(profile.typingStats.averageAccuracy)}%</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Race Count</p><p className="mt-3 text-2xl font-black text-white">{profile.racingStats.sessionsCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Best Race WPM</p><p className="mt-3 text-2xl font-black text-cyan-200">{metric(profile.racingStats.bestWpm)}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Wins / Podiums</p><p className="mt-3 text-2xl font-black text-amber-200">{profile.racingStats.winsCount} / {profile.racingStats.podiumCount}</p></div>
      </div>
    </section>
  );
}
