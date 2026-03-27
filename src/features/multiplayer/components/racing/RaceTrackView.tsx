import { useMemo } from "react";

import { MultiplayerPlayer, RaceResult, RoomStatus } from "../../types/multiplayerTypes";

interface RaceTrackViewProps {
  participants: MultiplayerPlayer[];
  results: RaceResult[];
  winnerUserId: string | null;
  roomStatus: RoomStatus | undefined;
}

const TRACK_POSITION_CLASSES = [
  "left-[4%]",
  "left-[12%]",
  "left-[20%]",
  "left-[28%]",
  "left-[36%]",
  "left-[44%]",
  "left-[52%]",
  "left-[60%]",
  "left-[68%]",
  "left-[76%]",
  "left-[84%]",
  "left-[92%]",
  "left-[96%]",
];

function getTrackPositionClass(position: number): string {
  const clamped = Math.min(96, Math.max(4, position));
  const normalized = (clamped - 4) / 92;
  const index = Math.round(normalized * (TRACK_POSITION_CLASSES.length - 1));
  return TRACK_POSITION_CLASSES[index] ?? TRACK_POSITION_CLASSES[0];
}

export function RaceTrackView({ participants, results, winnerUserId, roomStatus }: RaceTrackViewProps) {
  const maxObservedWpm = useMemo(() => {
    const maxValue = participants.reduce((maxWpm, participant) => {
      return Math.max(maxWpm, participant.progress.wpm);
    }, 0);

    return Math.max(maxValue, 40);
  }, [participants]);

  const rankMap = useMemo(() => {
    return new Map(results.map((result) => [result.userId, result.rank]));
  }, [results]);

  const raceLanes = useMemo(() => {
    return participants.map((participant) => {
      const speedPosition = Math.min(100, (participant.progress.wpm / maxObservedWpm) * 100);
      const rank = rankMap.get(participant.userId);
      const isWinner = winnerUserId === participant.userId;

      const finalPosition =
        roomStatus === "finished" && rank
          ? Math.max(10, 100 - (rank - 1) * (80 / Math.max(participants.length - 1, 1)))
          : speedPosition;

      return {
        ...participant,
        isWinner,
        positionClass: getTrackPositionClass(finalPosition),
      };
    });
  }, [maxObservedWpm, participants, rankMap, roomStatus, winnerUserId]);

  return (
    <div className="rounded-xl border border-cyan-200/20 bg-slate-950/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-100">
          Live Track View
        </h3>
        <span className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
          Top view | speed based
        </span>
      </div>

      <div className="space-y-2">
        {raceLanes.map((participant) => (
          <div key={`track-${participant.userId}`} className="rounded-lg border border-white/10 bg-slate-900/50 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-100">
                {participant.name}
                {participant.isHost ? " (Host)" : ""}
                {participant.isWinner ? " (Winner)" : ""}
              </p>
              <p className="text-[11px] font-semibold text-cyan-200">
                {participant.progress.wpm.toFixed(1)} WPM
              </p>
            </div>

            <div className="relative h-12 overflow-hidden rounded-full border border-slate-700/70 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-400/35" />

              <div
                className={`absolute top-1/2 h-6 w-10 -translate-x-1/2 -translate-y-1/2 rounded-md border border-cyan-200/40 bg-cyan-300/90 shadow-[0_0_16px_rgba(34,211,238,0.35)] transition-all duration-300 ${participant.positionClass}`}
              >
                <div className="absolute -bottom-1 left-1 h-2 w-2 rounded-full bg-slate-950" />
                <div className="absolute -bottom-1 right-1 h-2 w-2 rounded-full bg-slate-950" />
                <div className="absolute left-2 top-1 h-2 w-5 rounded-sm bg-slate-900/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
