import { TextRenderer } from "@/features/typing-engine/components/TextRenderer";
import { RoomStatus } from "../../types/multiplayerTypes";

interface RaceTypingPanelProps {
  loadingMessage: string;
  countdownSeconds: number | null;
  remainingSeconds: number | null;
  roomStatus: RoomStatus | undefined;
  activeText: string;
  typedCharacters: string[];
  currentIndex: number;
  onRestart: () => void;
}

export function RaceTypingPanel({
  loadingMessage,
  countdownSeconds,
  remainingSeconds,
  roomStatus,
  activeText,
  typedCharacters,
  currentIndex,
  onRestart,
}: RaceTypingPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-sky-200/20 bg-slate-900/40 p-4">
      {loadingMessage ? (
        <p className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
          {loadingMessage}
        </p>
      ) : null}

      {countdownSeconds !== null ? (
        <p className="rounded-lg border border-cyan-200/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">
          Race starts in {countdownSeconds} second{countdownSeconds === 1 ? "" : "s"}
        </p>
      ) : null}

      {remainingSeconds !== null && roomStatus === "racing" ? (
        <p className="rounded-lg border border-emerald-200/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
          Time left: {remainingSeconds}s
        </p>
      ) : null}

      {activeText && (roomStatus === "racing" || roomStatus === "finished") ? (
        <TextRenderer
          text={activeText}
          typedCharacters={typedCharacters}
          currentIndex={currentIndex}
          isFinished={roomStatus === "finished"}
          onRestart={onRestart}
        />
      ) : (
        <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          {roomStatus === "countdown"
            ? "Get ready... prompt will appear when race starts."
            : "Waiting in lobby. Prompt is hidden until race begins."}
        </p>
      )}
    </div>
  );
}
