import { MultiplayerPlayer } from "../../types/multiplayerTypes";

interface RaceLeaderboardProps {
  participants: MultiplayerPlayer[];
}

export function RaceLeaderboard({ participants }: RaceLeaderboardProps) {
  return (
    <>
      <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-200">
        Live Leaderboard
      </h3>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                {participant.name}
                {participant.isHost ? " (Host)" : ""}
                {!participant.isConnected ? " [Offline]" : ""}
              </p>
              <span className="text-xs text-slate-400">{participant.progress.wpm.toFixed(1)} WPM</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {participant.progress.typedCharacters} chars | {participant.progress.accuracy.toFixed(1)}%
              accuracy | {participant.progress.mistakes} mistakes
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
