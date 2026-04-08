import { useMemo } from "react";

import { MultiplayerPlayer, RaceResult, RoomStatus } from "../../types/multiplayerTypes";

interface RaceTrackViewProps {
  participants: MultiplayerPlayer[];
  results: RaceResult[];
  winnerUserId: string | null;
  roomStatus: RoomStatus | undefined;
}

const TRACK_POSITION_CLASSES = [
  "race-track-pos-0",
  "race-track-pos-1",
  "race-track-pos-2",
  "race-track-pos-3",
  "race-track-pos-4",
  "race-track-pos-5",
  "race-track-pos-6",
  "race-track-pos-7",
  "race-track-pos-8",
  "race-track-pos-9",
  "race-track-pos-10",
  "race-track-pos-11",
  "race-track-pos-12",
];

function getTrackPositionClass(position: number): string {
  const clamped = Math.min(96, Math.max(4, position));
  const normalized = (clamped - 4) / 92;
  const index = Math.round(normalized * (TRACK_POSITION_CLASSES.length - 1));
  return TRACK_POSITION_CLASSES[index] ?? TRACK_POSITION_CLASSES[0];
}

function getRunnerSpeedClass(wpm: number, maxObservedWpm: number): string {
  const ratio = Math.min(1, Math.max(0, wpm / maxObservedWpm));

  if (ratio >= 0.85) {
    return "race-track-runner--speed-1";
  }

  if (ratio >= 0.65) {
    return "race-track-runner--speed-2";
  }

  if (ratio >= 0.45) {
    return "race-track-runner--speed-3";
  }

  if (ratio >= 0.25) {
    return "race-track-runner--speed-4";
  }

  return "race-track-runner--speed-5";
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
        runnerSpeedClass: getRunnerSpeedClass(participant.progress.wpm, maxObservedWpm),
        positionClass: getTrackPositionClass(finalPosition),
      };
    });
  }, [maxObservedWpm, participants, rankMap, roomStatus, winnerUserId]);

  return (
    <div className="rounded-xl  bg-slate-950/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-100">
          Live Track View
        </h3>
        <span className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
          Runner view | speed based
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

            <div className="relative h-16 overflow-hidden rounded-full border border-slate-700/70 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute inset-x-2 bottom-0.5 h-2 rounded-full bg-slate-950/65" />
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300/30" />

              <div
                className={`absolute bottom-0.5 z-10 transition-all duration-300 ${participant.positionClass}`}
              >
                <div
                  className={`race-track-runner ${participant.runnerSpeedClass} ${
                    participant.isWinner ? "race-track-runner--winner" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
