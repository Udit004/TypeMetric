import { MultiplayerPlayer, RaceResult } from "../../types/multiplayerTypes";

interface RaceCompletionPanelProps {
  participants: MultiplayerPlayer[];
  results: RaceResult[];
  winnerUserId: string | null;
  isHost: boolean;
  onStartNextRace: () => void;
}

interface CompletionRow {
  userId: string;
  name: string;
  rank: number;
  wpm: number;
  accuracy: number;
  typedCharacters: number;
  mistakes: number;
}

function toCompletionRows(participants: MultiplayerPlayer[], results: RaceResult[]): CompletionRow[] {
  if (results.length > 0) {
    return results.map((result) => ({
      userId: result.userId,
      name: result.name,
      rank: result.rank,
      wpm: result.wpm,
      accuracy: result.accuracy,
      typedCharacters: result.typedCharacters,
      mistakes: result.mistakes,
    }));
  }

  return [...participants]
    .sort((a, b) => b.progress.wpm - a.progress.wpm)
    .map((participant, index) => ({
      userId: participant.userId,
      name: participant.name,
      rank: index + 1,
      wpm: participant.progress.wpm,
      accuracy: participant.progress.accuracy,
      typedCharacters: participant.progress.typedCharacters,
      mistakes: participant.progress.mistakes,
    }));
}

export function RaceCompletionPanel({
  participants,
  results,
  winnerUserId,
  isHost,
  onStartNextRace,
}: RaceCompletionPanelProps) {
  const rows = toCompletionRows(participants, results);
  const winner =
    rows.find((row) => row.userId === winnerUserId) || rows.find((row) => row.rank === 1) || null;

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-200/20 bg-emerald-500/5 p-4">
      <div className="rounded-xl border border-emerald-200/25 bg-emerald-400/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
          Race Complete
        </p>
        <h3 className="mt-2 text-2xl font-black text-emerald-50">
          {winner ? `${winner.name} wins the race` : "Race finished"}
        </h3>
        {winner ? (
          <p className="mt-1 text-sm text-emerald-100/90">
            {winner.wpm.toFixed(1)} WPM | {winner.accuracy.toFixed(1)}% accuracy
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={`result-${row.userId}`} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Rank #{row.rank}</p>
            <p className="mt-1 text-base font-bold text-white">{row.name}</p>
            <p className="mt-1 text-xs text-slate-300">
              {row.wpm.toFixed(1)} WPM | {row.accuracy.toFixed(1)}% accuracy
            </p>
            <p className="text-xs text-slate-400">
              {row.typedCharacters} chars | {row.mistakes} mistakes
            </p>
          </div>
        ))}
      </div>

      {isHost ? (
        <button
          type="button"
          onClick={onStartNextRace}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start New Race
        </button>
      ) : (
        <p className="text-xs text-slate-300">Waiting for host to start a new race...</p>
      )}
    </div>
  );
}
