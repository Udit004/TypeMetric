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
  score: number;
  wpm: number;
  accuracy: number;
  typedCharacters: number;
  mistakes: number;
}

interface PodiumSlot {
  row: CompletionRow;
  stageHeightClass: string;
  stageToneClass: string;
  glowClass: string;
}

interface CelebrationParticle {
  positionClass: string;
  toneClass: string;
  motionClass: string;
  shapeClass: string;
}

const SCORE_WEIGHTS = {
  wpm: 0.6,
  accuracy: 0.3,
  completion: 0.1,
  mistakePenalty: 0.35,
  finishBonus: 2,
};

const CELEBRATION_PARTICLES: CelebrationParticle[] = [
  {
    positionClass: "left-[6%] top-[10%]",
    toneClass: "bg-cyan-300/80",
    motionClass: "animate-bounce",
    shapeClass: "h-2 w-2 rounded-full",
  },
  {
    positionClass: "left-[14%] top-[24%]",
    toneClass: "bg-emerald-300/80",
    motionClass: "animate-pulse",
    shapeClass: "h-3 w-1.5 rounded-sm rotate-12",
  },
  {
    positionClass: "left-[22%] top-[8%]",
    toneClass: "bg-amber-300/80",
    motionClass: "animate-ping",
    shapeClass: "h-2 w-2 rounded-full",
  },
  {
    positionClass: "left-[30%] top-[18%]",
    toneClass: "bg-fuchsia-300/80",
    motionClass: "animate-bounce",
    shapeClass: "h-3 w-1.5 rounded-sm -rotate-12",
  },
  {
    positionClass: "left-[40%] top-[6%]",
    toneClass: "bg-sky-300/80",
    motionClass: "animate-pulse",
    shapeClass: "h-2 w-2 rounded-full",
  },
  {
    positionClass: "left-[52%] top-[22%]",
    toneClass: "bg-lime-300/80",
    motionClass: "animate-bounce",
    shapeClass: "h-3 w-1.5 rounded-sm rotate-6",
  },
  {
    positionClass: "left-[62%] top-[9%]",
    toneClass: "bg-rose-300/80",
    motionClass: "animate-ping",
    shapeClass: "h-2 w-2 rounded-full",
  },
  {
    positionClass: "left-[72%] top-[20%]",
    toneClass: "bg-indigo-300/80",
    motionClass: "animate-pulse",
    shapeClass: "h-3 w-1.5 rounded-sm -rotate-6",
  },
  {
    positionClass: "left-[82%] top-[8%]",
    toneClass: "bg-cyan-300/80",
    motionClass: "animate-bounce",
    shapeClass: "h-2 w-2 rounded-full",
  },
  {
    positionClass: "left-[90%] top-[24%]",
    toneClass: "bg-amber-300/80",
    motionClass: "animate-pulse",
    shapeClass: "h-3 w-1.5 rounded-sm rotate-12",
  },
];

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function hashValue(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }

  return hash;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "??";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getAvatarToneClass(userId: string): string {
  const avatarTones = [
    "bg-linear-to-br from-cyan-300 to-blue-500",
    "bg-linear-to-br from-fuchsia-300 to-purple-500",
    "bg-linear-to-br from-emerald-300 to-green-500",
    "bg-linear-to-br from-amber-300 to-orange-500",
    "bg-linear-to-br from-rose-300 to-red-500",
    "bg-linear-to-br from-sky-300 to-indigo-500",
  ];

  const index = hashValue(userId) % avatarTones.length;
  return avatarTones[index] ?? avatarTones[0];
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
  const firstPlace = topThree.find((row) => row.rank === 1);
  const secondPlace = topThree.find((row) => row.rank === 2);
  const thirdPlace = topThree.find((row) => row.rank === 3);

  const podiumOrder: PodiumSlot[] = [];

  if (topThree.length === 1 && firstPlace) {
    podiumOrder.push({
      row: firstPlace,
      stageHeightClass: "h-32",
      stageToneClass: "bg-linear-to-t from-amber-500/90 to-yellow-300/90",
      glowClass: "shadow-[0_0_28px_rgba(250,204,21,0.45)]",
    });
  }

  if (topThree.length === 2) {
    if (secondPlace) {
      podiumOrder.push({
        row: secondPlace,
        stageHeightClass: "h-24",
        stageToneClass: "bg-linear-to-t from-slate-500/90 to-slate-300/80",
        glowClass: "shadow-[0_0_22px_rgba(148,163,184,0.35)]",
      });
    }

    if (firstPlace) {
      podiumOrder.push({
        row: firstPlace,
        stageHeightClass: "h-32",
        stageToneClass: "bg-linear-to-t from-amber-500/90 to-yellow-300/90",
        glowClass: "shadow-[0_0_28px_rgba(250,204,21,0.45)]",
      });
    }
  }

  if (topThree.length >= 3) {
    if (secondPlace) {
      podiumOrder.push({
        row: secondPlace,
        stageHeightClass: "h-24",
        stageToneClass: "bg-linear-to-t from-slate-500/90 to-slate-300/80",
        glowClass: "shadow-[0_0_22px_rgba(148,163,184,0.35)]",
      });
    }

    if (firstPlace) {
      podiumOrder.push({
        row: firstPlace,
        stageHeightClass: "h-32",
        stageToneClass: "bg-linear-to-t from-amber-500/90 to-yellow-300/90",
        glowClass: "shadow-[0_0_28px_rgba(250,204,21,0.45)]",
      });
    }

    if (thirdPlace) {
      podiumOrder.push({
        row: thirdPlace,
        stageHeightClass: "h-20",
        stageToneClass: "bg-linear-to-t from-orange-600/90 to-amber-400/80",
        glowClass: "shadow-[0_0_20px_rgba(251,146,60,0.35)]",
      });
    }
  }

  const podiumGridClass =
    podiumOrder.length === 1
      ? "grid-cols-1 mx-auto max-w-[220px]"
      : podiumOrder.length === 2
        ? "grid-cols-2 mx-auto max-w-[420px]"
        : "grid-cols-3";

  return (
    <div className="space-y-6 rounded-2xl border border-cyan-200/20 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-xl border border-cyan-200/25 bg-linear-to-r from-emerald-400/10 via-cyan-400/10 to-sky-400/10 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="pointer-events-none absolute inset-0">
          {CELEBRATION_PARTICLES.map((particle, index) => (
            <span
              key={`celebration-${index}`}
              className={`absolute ${particle.positionClass} ${particle.toneClass} ${particle.motionClass} ${particle.shapeClass}`}
            />
          ))}
        </div>
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
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
          Podium
        </p>

        <div className={`grid items-end gap-3 ${podiumGridClass}`}>
          {podiumOrder.map((slot) => (
            <div key={`podium-${slot.row.userId}`} className="flex flex-col items-center gap-2">
              <div className="relative">
                {slot.row.rank === 1 ? (
                  <>
                    <span className="pointer-events-none absolute -inset-2 rounded-full border border-yellow-200/40 animate-ping" />
                    <span className="pointer-events-none absolute -inset-1 rounded-full border border-cyan-200/35 animate-pulse" />
                  </>
                ) : null}
                <div
                  className={`relative grid h-14 w-14 place-items-center rounded-full border border-white/30 text-sm font-black text-slate-950 ${getAvatarToneClass(slot.row.userId)} ${slot.row.rank === 1 ? "animate-pulse" : ""}`}
                >
                  {getInitials(slot.row.name)}
                </div>
              </div>
              <p className="text-center text-xs font-semibold text-slate-100">{slot.row.name}</p>
              <p className="text-[11px] text-cyan-100">{slot.row.score.toFixed(2)}</p>

              <div
                className={`w-full rounded-t-xl border border-white/20 ${slot.stageHeightClass} ${slot.stageToneClass} ${slot.glowClass} grid place-items-center`}
              >
                <span className="text-sm font-black text-slate-950">#{slot.row.rank}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
          Final Standings
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={`result-${row.userId}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3"
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-full border border-white/30 text-xs font-black text-slate-950 ${getAvatarToneClass(row.userId)}`}
              >
                {getInitials(row.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Rank #{row.rank}
                </p>
                <p className="truncate text-base font-bold text-white">{row.name}</p>
                <p className="text-xs text-slate-300">
                  Score {row.score.toFixed(2)} | {row.wpm.toFixed(1)} WPM | {row.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  {row.typedCharacters} chars | {row.mistakes} mistakes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
