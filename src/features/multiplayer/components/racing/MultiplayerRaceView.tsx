"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RaceCompletionPanel } from "./RaceCompletionPanel";
import { RaceLeaderboard } from "./RaceLeaderboard";
import { RaceRoomHeader } from "./RaceRoomHeader";
import { RaceTrackView } from "./RaceTrackView";
import { RaceTypingPanel } from "./RaceTypingPanel";

import { useMultiplayerRoom } from "../../hooks/useMultiplayerRoom";
import { getRoomApi, joinRoomApi } from "../../services/multiplayerRoomService";
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
  const participants = useMemo(() => room?.participants ?? [], [room?.participants]);

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

  const me = participants.find((participant) => participant.userId === user?.id);
  const isHost = Boolean(me?.isHost);
  const isRaceFinished = room?.status === "finished";

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

  if (isRaceFinished) {
    return (
      <section className="space-y-5 rounded-3xl border border-sky-200/20 bg-slate-950/40 p-4 backdrop-blur-md sm:p-6">
        <RaceCompletionPanel
          participants={participants}
          results={results}
          winnerUserId={winnerUserId}
          isHost={isHost}
          onStartNextRace={startRace}
        />
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-sky-200/20 bg-slate-950/40 p-4 backdrop-blur-md sm:p-6">
      <RaceRoomHeader
        roomId={roomId}
        didCopyLink={didCopyLink}
        isHost={isHost}
        roomStatus={room?.status}
        onCopyInviteLink={handleCopyInviteLink}
        onStartRace={startRace}
        onLeaveRoom={handleLeaveRoom}
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <RaceTypingPanel
          loadingMessage={loadingMessage}
          countdownSeconds={countdownSeconds}
          remainingSeconds={remainingSeconds}
          roomStatus={room?.status}
          activeText={activeText}
          typedCharacters={typedCharacters}
          currentIndex={currentIndex}
          onRestart={resetTyping}
        />
        <div className="space-y-3 rounded-2xl border border-sky-200/20 bg-slate-900/40 p-4">
          <RaceTrackView
            participants={participants}
            results={results}
            winnerUserId={winnerUserId}
            roomStatus={room?.status}
          />
          <RaceLeaderboard participants={participants} />
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
