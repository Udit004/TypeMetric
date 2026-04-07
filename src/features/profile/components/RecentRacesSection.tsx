import { RecentRace } from "../types";
import { formatDate, metric } from "./profileFormatters";

interface RecentRacesSectionProps {
  races: RecentRace[];
}

export function RecentRacesSection({ races }: RecentRacesSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <div>
        <h2 className="text-lg font-bold text-white">Recent Multiplayer Races</h2>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs uppercase tracking-[0.16em] text-slate-400">
              <th className="px-3 py-3">Rank</th>
              <th className="px-3 py-3">WPM</th>
              <th className="px-3 py-3">Score</th>
              <th className="px-3 py-3">Played</th>
            </tr>
          </thead>
          <tbody>
            {races.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={4}>
                  No multiplayer races yet.
                </td>
              </tr>
            ) : (
              races.map((race) => (
                <tr key={race.id} className="border-b border-white/6 last:border-b-0">
                  <td className="px-3 py-3 font-semibold text-white">#{race.rank}</td>
                  <td className="px-3 py-3 text-cyan-200">{metric(race.wpm)}</td>
                  <td className="px-3 py-3 text-slate-200">{metric(race.score)}</td>
                  <td className="px-3 py-3 text-slate-400">{formatDate(race.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
