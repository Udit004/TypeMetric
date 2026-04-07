import { RecentTypingSession } from "../types";
import { formatDate, metric } from "./profileFormatters";

interface RecentTypingSessionsSectionProps {
  sessions: RecentTypingSession[];
}

export function RecentTypingSessionsSection({ sessions }: RecentTypingSessionsSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <div>
        <h2 className="text-lg font-bold text-white">Recent Typing Sessions</h2>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs uppercase tracking-[0.16em] text-slate-400">
              <th className="px-3 py-3">WPM</th>
              <th className="px-3 py-3">Accuracy</th>
              <th className="px-3 py-3">Mistakes</th>
              <th className="px-3 py-3">Played</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={4}>
                  No solo sessions yet.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="border-b border-white/6 last:border-b-0">
                  <td className="px-3 py-3 text-cyan-200">{metric(session.wpm)}</td>
                  <td className="px-3 py-3 text-emerald-200">{metric(session.accuracy)}%</td>
                  <td className="px-3 py-3 text-slate-200">{session.mistakes}</td>
                  <td className="px-3 py-3 text-slate-400">{formatDate(session.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
