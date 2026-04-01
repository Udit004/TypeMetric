"use client";

import { useRoomVoiceChat } from "../../hooks/useRoomVoiceChat";

interface RoomVoicePanelProps {
  roomId: string;
  token: string | null;
  className?: string;
}

export function RoomVoicePanel({ roomId, token, className }: RoomVoicePanelProps) {
  const {
    isSupported,
    isConnecting,
    isConnected,
    isMicMuted,
    isSpeakerMuted,
    connectedParticipants,
    errorMessage,
    toggleMicMute,
    toggleSpeakerMute,
    clearError,
  } = useRoomVoiceChat({
    roomId,
    authToken: token,
  });

  return (
    <section className={`rounded-2xl border border-emerald-200/20 bg-emerald-950/20 px-3 py-2 ${className ?? ""}`}>
      <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200/75">Room Voice</p>
        <span className="text-xs font-semibold text-emerald-100/90">
          {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Not connected"}
        </span>
        <span className="rounded-full border border-emerald-200/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-100">
          {connectedParticipants}
        </span>

        <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => void toggleMicMute()}
          disabled={!isConnected || isConnecting || !token || !isSupported}
          aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
          title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
          className="cursor-pointer grid h-9 w-9 place-items-center rounded-lg border border-emerald-100/30 bg-emerald-500/10 text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMicMuted ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 10v2a6 6 0 0 1-10.24 4.24" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 1 1-14 0v-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={toggleSpeakerMute}
          disabled={!isConnected || isConnecting || !token || !isSupported}
          aria-label={isSpeakerMuted ? "Unmute speaker" : "Mute speaker"}
          title={isSpeakerMuted ? "Unmute speaker" : "Mute speaker"}
          className="cursor-pointer grid h-9 w-9 place-items-center rounded-lg border border-sky-100/30 bg-sky-500/10 text-sky-100 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSpeakerMuted ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 6 7 9H4v6h3l4 3V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m16 9 5 5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 9-5 5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 6 7 9H4v6h3l4 3V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10a4 4 0 0 1 0 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 7.5a7 7 0 0 1 0 9" />
            </svg>
          )}
        </button>
        </div>
      </div>

      {!isSupported ? (
        <p className="mt-2 rounded-lg border border-amber-200/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Your browser does not support voice chat.
        </p>
      ) : null}

      {errorMessage ? (
        <button
          type="button"
          onClick={clearError}
          className="mt-3 rounded-lg border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-left text-xs text-rose-100"
        >
          {errorMessage} (click to dismiss)
        </button>
      ) : null}
    </section>
  );
}
