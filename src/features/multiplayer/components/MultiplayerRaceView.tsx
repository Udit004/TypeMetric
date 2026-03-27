"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMultiplayerRoom } from "../hooks/useMultiplayerRoom";
import { getRoomApi, joinRoomApi } from "../services/multiplayerRoomService";
import { TextRenderer } from "@/features/typing-engine/components/TextRenderer";
import { useTypingEngine } from "@/features/typing-engine/hooks/useTypingEngine";
import { calculateAccuracy, calculateWPM } from "@/features/typing-engine/lib/metrics";
import { parseTextToCharacters } from "@/features/typing-engine/lib/textParser";
import { isCharacterCorrect } from "@/features/typing-engine/lib/validation";
import { useAuth } from "@/share/hooks/useAuth";

interface MultiplayerRaceViewProps {
  roomId: string;
}

export function MultiplayerRaceView({ roomId }: MultiplayerRaceViewProps) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const {
    room,
    isConnected,
    countdownSeconds,
    remainingSeconds,
    results,
    winnerUserId,
    errorMessage,
    clearError,
    joinRoom,
    syncRoom,
    startRace,
    hydrateRoom,
    sendProgress,
    leaveRoom,
  } = useMultiplayerRoom(token);

  const [loadingMessage, setLoadingMessage] = useState("Joining room...");
  const [didCopyLink, setDidCopyLink] = useState(false);

  const activeText = room?.promptText || "";
  const parsedText = useMemo(() => parseTextToCharacters(activeText), [activeText]);

  const { currentIndex, mistakes, typedCharacters, handleKeyDown, resetTyping } =
    useTypingEngine(activeText);

  const previousStatusRef = useRef<string | null>(null);

  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce((count, typedChar, index) => {
        return isCharacterCorrect(typedChar, parsedText[index] ?? "") ? count + 1 : count;
      }, 0),
    [parsedText, typedCharacters]
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !isConnected) {
      return;
    }

    let isCancelled = false;

    const initRoom = async () => {
      setLoadingMessage("Joining room...");

      try {
        const joined = await joinRoomApi(roomId, token);
        hydrateRoom(joined.room);

        if (isCancelled) {
          return;
        }

        joinRoom(roomId);
        setLoadingMessage("Syncing race state...");

        const snapshot = await getRoomApi(roomId, token);
        hydrateRoom(snapshot.room);
        syncRoom(roomId);
        setLoadingMessage("");
      } catch {
        if (!isCancelled) {
          setLoadingMessage("");
        }
      }
    };

    void initRoom();

    return () => {
      isCancelled = true;
    };
  }, [hydrateRoom, isAuthenticated, isConnected, joinRoom, roomId, syncRoom, token]);

  useEffect(() => {
    const currentStatus = room?.status ?? null;

    if (previousStatusRef.current !== "racing" && currentStatus === "racing") {
      resetTyping();
    }

    previousStatusRef.current = currentStatus;
  }, [resetTyping, room?.status]);

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isEditableTarget) {
        return;
      }

      if (room?.status !== "racing") {
        return;
      }

      handleKeyDown(event);
    };

    window.addEventListener("keydown", onWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [handleKeyDown, room?.status]);

  useEffect(() => {
    if (!room || room.status !== "racing") {
      return;
    }

    const elapsedMs =
      room.startedAt && room.startedAt > 0 ? Math.max(0, Date.now() - room.startedAt) : 0;

    sendProgress(room.roomId, {
      typedCharacters: typedCharacters.length,
      correctCharacters,
      mistakes,
      accuracy: calculateAccuracy(correctCharacters, typedCharacters.length),
      wpm: calculateWPM(typedCharacters.length, elapsedMs),
    });
  }, [correctCharacters, mistakes, room, sendProgress, typedCharacters.length]);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/multiplayer/room/${roomId}`
      : `/multiplayer/room/${roomId}`;

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setDidCopyLink(true);
      setTimeout(() => setDidCopyLink(false), 1200);
    } catch {
      setDidCopyLink(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/multiplayer");
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-rose-200/20 bg-rose-500/10 p-6 text-rose-100">
        <h2 className="text-xl font-bold">Login required</h2>
        <p className="mt-2 text-sm text-rose-100/80">You need an account to join this race.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-lg border border-rose-100/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-100"
        >
          Back to home
        </Link>
      </section>
    );
  }

  const me = room?.participants.find((participant) => participant.userId === user?.id);
  const isHost = Boolean(me?.isHost);

  return (
    <section className="space-y-5 rounded-3xl border border-sky-200/20 bg-slate-950/40 p-4 backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200/20 bg-slate-900/50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Room</p>
          <p className="text-lg font-black text-white">#{roomId}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="rounded-lg border border-white/15 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            {didCopyLink ? "Copied" : "Copy Invite Link"}
          </button>
          {isHost && (room?.status === "waiting" || room?.status === "finished") ? (
            <button
              type="button"
              onClick={startRace}
              className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {room?.status === "finished" ? "Start Next Race" : "Start Race"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleLeaveRoom}
            className="rounded-lg border border-rose-200/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
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

          {remainingSeconds !== null && room?.status === "racing" ? (
            <p className="rounded-lg border border-emerald-200/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              Time left: {remainingSeconds}s
            </p>
          ) : null}

          {activeText ? (
            <TextRenderer
              text={activeText}
              typedCharacters={typedCharacters}
              currentIndex={currentIndex}
              isFinished={room?.status === "finished"}
              onRestart={resetTyping}
            />
          ) : (
            <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
              Waiting for room state...
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-sky-200/20 bg-slate-900/40 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-200">
            Live Leaderboard
          </h3>

          <div className="space-y-2">
            {room?.participants.map((participant) => (
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

          {room?.status === "finished" && results.length > 0 ? (
            <div className="mt-3 space-y-2 rounded-xl border border-emerald-200/25 bg-emerald-400/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                Final Results
              </p>
              {results.map((result) => (
                <p key={result.userId} className="text-sm text-emerald-50">
                  #{result.rank} {result.name}
                  {winnerUserId === result.userId ? " (Winner)" : ""} - {result.wpm.toFixed(1)} WPM
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {!isConnected ? (
        <p className="rounded-lg border border-amber-200/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Reconnecting to race server...
        </p>
      ) : null}

      {errorMessage ? (
        <button
          type="button"
          onClick={clearError}
          className="rounded-lg border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-left text-xs text-rose-100"
        >
          {errorMessage} (click to dismiss)
        </button>
      ) : null}
    </section>
  );
}
