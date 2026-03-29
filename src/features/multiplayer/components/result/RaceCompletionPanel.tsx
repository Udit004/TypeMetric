import { MultiplayerPlayer, RaceResult } from "../../types/multiplayerTypes";
import { RaceCompletionScene } from "./RaceCompletionScene";
import { type CompletionRow } from "./RaceCompletionPanel2D";

interface RaceCompletionPanelProps {
  participants: MultiplayerPlayer[];
  results: RaceResult[];
  winnerUserId: string | null;
  isHost: boolean;
  onStartNextRace: () => void;
}

const SCORE_WEIGHTS = {
  wpm: 0.6,
  accuracy: 0.3,
  completion: 0.1,
  mistakePenalty: 0.35,
  finishBonus: 2,
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeScore(
  typedCharacters: number,
  wpm: number,
  accuracy: number,
  mistakes: number,
  didFinish: boolean,
  maxTypedCharacters: number
): number {
  const promptLength = Math.max(1, maxTypedCharacters);
  const completionRatio = Math.min(1, typedCharacters / promptLength);
  const completionScore = completionRatio * 100;

  const rawScore =
    wpm * SCORE_WEIGHTS.wpm +
    accuracy * SCORE_WEIGHTS.accuracy +
    completionScore * SCORE_WEIGHTS.completion -
    mistakes * SCORE_WEIGHTS.mistakePenalty +
    (didFinish ? SCORE_WEIGHTS.finishBonus : 0);

  return roundToTwo(Math.max(0, rawScore));
}

function toCompletionRows(participants: MultiplayerPlayer[], results: RaceResult[]): CompletionRow[] {
  const maxTypedCharacters = participants.reduce((maxValue, participant) => {
    return Math.max(maxValue, participant.progress.typedCharacters);
  }, 0);

  if (results.length > 0) {
    return results.map((result) => ({
      userId: result.userId,
      name: result.name,
      rank: result.rank,
      score: result.score,
      wpm: result.wpm,
      accuracy: result.accuracy,
      typedCharacters: result.typedCharacters,
      mistakes: result.mistakes,
    }));
  }

  return [...participants]
    .map((participant) => ({
      participant,
      score: computeScore(
        participant.progress.typedCharacters,
        participant.progress.wpm,
        participant.progress.accuracy,
        participant.progress.mistakes,
        participant.progress.finishedAt !== null,
        maxTypedCharacters
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      userId: item.participant.userId,
      name: item.participant.name,
      rank: index + 1,
      score: item.score,
      wpm: item.participant.progress.wpm,
      accuracy: item.participant.progress.accuracy,
      typedCharacters: item.participant.progress.typedCharacters,
      mistakes: item.participant.progress.mistakes,
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
  const topThree = rows.filter((row) => row.rank <= 3);

  return (
    <div className="space-y-6 rounded-2xl border border-cyan-200/20 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-xl border border-cyan-200/25 bg-linear-to-r from-emerald-400/10 via-cyan-400/10 to-sky-400/10 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/30 animate-ping" />
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
          Race Complete
        </p>
        <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          {winner ? `${winner.name} wins the race` : "Race finished"}
        </h3>
        {winner ? (
          <p className="mt-1 text-sm text-cyan-100/90">
            Score {winner.score.toFixed(2)} | {winner.wpm.toFixed(1)} WPM | {winner.accuracy.toFixed(1)}%
            accuracy
          </p>
        ) : null}

        <RaceCompletionScene
          entries={topThree.map((row) => ({
            userId: row.userId,
            name: row.name,
            rank: row.rank,
            score: row.score,
            wpm: row.wpm,
            accuracy: row.accuracy,
          }))}
        />
      </div>

      {/* Keep legacy 2D result UI for future fallback.
      <RaceCompletionPanel2D rows={rows} />
      */}

      <div>
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
    </div>
  );
}
