export interface CompletionRow {
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

interface RaceCompletionPanel2DProps {
  rows: CompletionRow[];
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

export function RaceCompletionPanel2D({ rows }: RaceCompletionPanel2DProps) {
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
    <>
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
    </>
  );
}
