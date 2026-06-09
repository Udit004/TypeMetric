"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Howl } from "howler";
import { RaceCompletionPanel } from "../result/RaceCompletionPanel";
import { RaceCelebrationOverlay } from "./feedback/RaceCelebrationOverlay";
import { RaceLiveStats } from "./feedback/RaceLiveStats";
import {
  countCompletedSentences,
  countCompletedWords,
  getCurrentCorrectStreak,
  getLeadingCorrectCharacters,
} from "./feedback/raceFeedbackUtils";
import { useRaceFeedback } from "./feedback/useRaceFeedback";
import { RaceLeaderboard } from "./RaceLeaderboard";
import { RoomChatPanel } from "./RoomChatPanel";
import { RaceRoomHeader } from "./RaceRoomHeader";
import { RaceTrackView } from "./RaceTrackView";
import { RaceTypingPanel } from "./RaceTypingPanel";
import { RoomFriendInvitePanel } from "./RoomFriendInvitePanel";
import { RoomLobbyView } from "../room/RoomLobbyView";
import { useMultiplayerRoom } from "../../hooks/useMultiplayerRoom";
import { getRoomApi, joinRoomApi } from "../../services/multiplayerRoomService";
import { useSoundEffects } from "../../hooks/useSoundEffects";
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
    typingUserNames,
    errorMessage,
    roomClosed,
    clearError,
    joinRoom,
    syncRoom,
    startRace,
    returnToLobby,
    hydrateRoom,
    sendProgress,
    sendChatMessage,
    sendTypingStatus,
    leaveRoom,
  } = useMultiplayerRoom(token);

  const [loadingMessage, setLoadingMessage] = useState("Joining room...");
  const [didCopyLink, setDidCopyLink] = useState(false);
  const [visualNow, setVisualNow] = useState(() => Date.now());
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const { playCountdownTick, playRaceStart, playCheering, playVictory, stopCountdownTick, enableSoundOnInteraction } =
    useSoundEffects({ enabled: true, volume: 0.3 });

  const participants = useMemo(() => room?.participants ?? [], [room?.participants]);
  const roomIdValue = room?.roomId ?? null;
  const roomStatus = room?.status ?? null;
  const roomStartedAt = room?.startedAt ?? null;

  const activeText = room?.promptText || "";
  const parsedText = useMemo(() => parseTextToCharacters(activeText), [activeText]);

  const { currentIndex, mistakes, typedCharacters, handleKeyDown, resetTyping } =
    useTypingEngine(activeText);
  const raceBackgroundSoundRef = useRef<Howl | null>(null);

  // Enable sound on first user interaction
  useEffect(() => {
    window.addEventListener("click", enableSoundOnInteraction, { once: true });
    window.addEventListener("keydown", enableSoundOnInteraction, { once: true });

    return () => {
      window.removeEventListener("click", enableSoundOnInteraction);
      window.removeEventListener("keydown", enableSoundOnInteraction);
    };
  }, [enableSoundOnInteraction]);

  // Play countdown tick sound when countdown changes
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds === undefined) {
      return;
    }

    if (countdownSeconds > 0) {
      playCountdownTick();
    }

    if (countdownSeconds === 0) {
      stopCountdownTick();
      playRaceStart();
    }
  }, [countdownSeconds, playCountdownTick, playRaceStart, stopCountdownTick]);

  // Play cheering sounds during race
  useEffect(() => {
    if (room?.status !== "racing" || remainingSeconds === null) {
      return;
    }

    if (remainingSeconds > 0 && remainingSeconds % 10 === 0) {
      playCheering();
    }
  }, [remainingSeconds, room?.status, playCheering]);

  // Play victory sound when results arrive
  useEffect(() => {
    if (room?.status === "finished" && results.length > 0) {
      playVictory();
      playCheering();
    }
  }, [room?.status, results, playVictory, playCheering]);

  // Loop race background music only while race is active.
  useEffect(() => {
    if (!raceBackgroundSoundRef.current) {
      raceBackgroundSoundRef.current = new Howl({
        src: ["/sounds/raceBackgroundSound.mp3"],
        loop: true,
        volume: 0.14,
        html5: true,
        preload: true,
      });
    }

    const raceMusic = raceBackgroundSoundRef.current;

    if (room?.status === "racing") {
      if (!raceMusic.playing()) {
        raceMusic.play();
      }
      return;
    }

    raceMusic.stop();
  }, [room?.status]);

  useEffect(() => {
    return () => {
      raceBackgroundSoundRef.current?.stop();
      raceBackgroundSoundRef.current?.unload();
      raceBackgroundSoundRef.current = null;
    };
  }, []);

  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce((count, typedChar, index) => {
        return isCharacterCorrect(typedChar, parsedText[index] ?? "") ? count + 1 : count;
      }, 0),
    [parsedText, typedCharacters]
  );

  const leadingCorrectCharacters = useMemo(
    () => getLeadingCorrectCharacters(typedCharacters, parsedText),
    [parsedText, typedCharacters]
  );

  const completedWords = useMemo(
    () => countCompletedWords(activeText, leadingCorrectCharacters),
    [activeText, leadingCorrectCharacters]
  );

  const completedSentences = useMemo(
    () => countCompletedSentences(activeText, leadingCorrectCharacters),
    [activeText, leadingCorrectCharacters]
  );

  const currentCorrectStreak = useMemo(
    () => getCurrentCorrectStreak(typedCharacters, parsedText),
    [parsedText, typedCharacters]
  );

  const progressPercent = useMemo(() => {
    if (!activeText.length) {
      return 0;
    }

    return Math.min(100, (leadingCorrectCharacters / activeText.length) * 100);
  }, [activeText.length, leadingCorrectCharacters]);

  const { isFinishTransitionActive, momentBanner, reactionBursts } = useRaceFeedback({
    completedSentences,
    completedWords,
    onRaceStart: resetTyping,
    roomStatus: room?.status,
  });

  useEffect(() => {
    if (room?.status !== "racing") {
      return;
    }

    const tick = () => {
      setVisualNow(Date.now());
    };

    tick();
    const intervalId = window.setInterval(tick, 80);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [room?.status]);

  const progressPayload = useMemo(() => {
    const elapsedMs = roomStartedAt ? Math.max(0, visualNow - roomStartedAt) : 0;

    return {
      typedCharacters: typedCharacters.length,
      correctCharacters,
      mistakes,
      accuracy: calculateAccuracy(correctCharacters, typedCharacters.length),
      wpm: calculateWPM(typedCharacters.length, elapsedMs),
    };
  }, [correctCharacters, mistakes, roomStartedAt, typedCharacters.length, visualNow]);

  const currentUserId = user?.id ?? null;
  const liveParticipants =
    currentUserId && roomStatus === "racing"
      ? participants.map((participant) => {
          if (participant.userId !== currentUserId) {
            return participant;
          }

          const elapsedMs = roomStartedAt ? Math.max(0, visualNow - roomStartedAt) : 0;

          return {
            ...participant,
            progress: {
              ...participant.progress,
              typedCharacters: typedCharacters.length,
              correctCharacters,
              mistakes,
              accuracy: calculateAccuracy(correctCharacters, typedCharacters.length),
              wpm: calculateWPM(typedCharacters.length, elapsedMs),
              finishedAt: null,
            },
          };
        })
      : participants;

  useEffect(() => {
    if (!isAuthenticated || !token || !isConnected) {
      return;
    }

    let isCancelled = false;

    const initRoom = async () => {
      setLoadingMessage("Joining room...");

      try {
        let wasJoinedViaRest = false;

        try {
          const joined = await joinRoomApi(roomId, token);
          hydrateRoom(joined.room);
          wasJoinedViaRest = true;
        } catch {
          const snapshot = await getRoomApi(roomId, token);
          hydrateRoom(snapshot.room);
        }

        if (isCancelled) {
          return;
        }

        setLoadingMessage("Syncing race state...");

        if (!wasJoinedViaRest) {
          joinRoom(roomId);
        }

        syncRoom(roomId);
        setLoadingMessage("");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to join room";
        setLoadingMessage(message);
      }
    };

    void initRoom();

    return () => {
      isCancelled = true;
    };
  }, [hydrateRoom, isAuthenticated, isConnected, joinRoom, roomId, syncRoom, token]);

  useEffect(() => {
    if (!roomClosed) {
      return;
    }

    router.push("/multiplayer");
  }, [roomClosed, router]);

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
    if (!roomIdValue || roomStatus !== "racing") {
      return;
    }

    if (!roomStartedAt) {
      return;
    }

    const elapsedMs = Math.max(0, Date.now() - roomStartedAt);

    sendProgress(roomIdValue, {
      ...progressPayload,
      wpm: calculateWPM(progressPayload.typedCharacters, elapsedMs),
    });
  }, [progressPayload, roomIdValue, roomStartedAt, roomStatus, sendProgress]);

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
  const canStartRace = participants.length >= 2;
  const isRaceFinished = room?.status === "finished" && !isFinishTransitionActive;
  const isWaitingInLobby = room?.status === "waiting";

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
      <section className="relative space-y-5 rounded-3xl sm:p-6">
        <RaceCompletionPanel
          participants={participants}
          results={results}
          winnerUserId={winnerUserId}
          isHost={isHost}
          roomId={roomId}
          token={token}
          didCopyLink={didCopyLink}
          roomStatus={room?.status}
          onStartNextRace={startRace}
          onReturnToLobby={returnToLobby}
          onCopyInviteLink={handleCopyInviteLink}
          onLeaveRoom={handleLeaveRoom}
        />
      </section>
    );
  }

  if (isWaitingInLobby) {
    return (
      <section className="min-h-screen">
        <RaceRoomHeader
          roomId={roomId}
          token={token}
          didCopyLink={didCopyLink}
          isHost={isHost}
          roomStatus={room?.status}
          showStartButton={false}
          onCopyInviteLink={handleCopyInviteLink}
          onStartRace={startRace}
          onLeaveRoom={handleLeaveRoom}
        />

        <RoomLobbyView
          participants={participants}
          isHost={isHost}
          canStartRace={canStartRace}
          onStartRace={startRace}
          roomId={roomId}
          token={token}
          currentUserId={user?.id ?? null}
          currentUserName={user?.name ?? null}
          messages={room?.chatMessages ?? []}
          typingUserNames={typingUserNames}
          isConnected={isConnected}
          onSendMessage={(text) => sendChatMessage(roomId, text)}
          onTypingChange={(isTyping) => sendTypingStatus(roomId, isTyping)}
        />

        {!isConnected ? (
          <p className="rounded-lg border border-amber-200/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            Reconnecting to race server...
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="relative h-[850px] overflow-hidden rounded-2xl border border-sky-200/20 p-2 sm:h-[900px] sm:p-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.2),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(45,212,191,0.15),transparent_46%)]" />

      <div className="absolute right-4 top-24 z-20 flex flex-col gap-2.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            setShowChatPopup(!showChatPopup);
            setShowInvitePopup(false);
          }}
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-200 cursor-pointer ${
            showChatPopup
              ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              : "border-white/10 bg-slate-950/75 text-slate-400 hover:border-white/25 hover:text-white"
          }`}
          title="Toggle Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 4.75 4.75 0 0 0 3.292-1.412c.389-.387.896-.555 1.432-.555h.341Z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowInvitePopup(!showInvitePopup);
            setShowChatPopup(false);
          }}
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-200 cursor-pointer ${
            showInvitePopup
              ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              : "border-white/10 bg-slate-950/75 text-slate-400 hover:border-white/25 hover:text-white"
          }`}
          title="Toggle Invite Friends"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
        </button>
      </div>

      {showChatPopup && (
        <div className="absolute right-18 top-24 z-30 flex h-[480px] w-88 flex-col rounded-2xl border border-sky-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <h4 className="text-sm font-bold text-cyan-200">Room Chat</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowChatPopup(false)}
              className="rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:bg-white/5 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <RoomChatPanel
              messages={room?.chatMessages ?? []}
              currentUserId={user?.id ?? null}
              currentUserName={user?.name ?? null}
              typingUserNames={typingUserNames}
              isConnected={isConnected}
              onSendMessage={(text) => sendChatMessage(roomId, text)}
              onTypingChange={(isTyping) => sendTypingStatus(roomId, isTyping)}
              className="h-full bg-transparent border-0!"
            />
          </div>
        </div>
      )}

      {showInvitePopup && (
        <div className="absolute right-18 top-24 z-30 w-72 rounded-2xl border border-sky-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-sm font-bold text-cyan-200">Invite Friends</h4>
            <button
              type="button"
              onClick={() => setShowInvitePopup(false)}
              className="rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:bg-white/5 hover:text-white"
            >
              Close
            </button>
          </div>
          <RoomFriendInvitePanel roomId={roomId} token={token} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col overflow-y-auto p-3">
        <RaceCelebrationOverlay
          countdownSeconds={countdownSeconds}
          momentBanner={momentBanner}
          reactionBursts={reactionBursts}
          roomStatus={room?.status}
        />

        <div className="pointer-events-auto">
          <RaceRoomHeader
            roomId={roomId}
            token={token}
            didCopyLink={didCopyLink}
            isHost={isHost}
            roomStatus={room?.status}
            onCopyInviteLink={handleCopyInviteLink}
            onStartRace={startRace}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>

        <div className="mt-4 grid flex-1 gap-4 grid-cols-[minmax(0,1fr)_3.5rem] pointer-events-none">
          <div className="pointer-events-auto flex flex-col gap-4">
            <div className="rounded-2xl border border-sky-200/10 bg-slate-950/70 p-1 backdrop-blur-xs">
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
            </div>

            <RaceLiveStats
              accuracy={progressPayload.accuracy}
              completedWords={completedWords}
              mistakes={mistakes}
              progressPercent={progressPercent}
              streak={currentCorrectStreak}
              wpm={progressPayload.wpm}
            />

            <div className="rounded-2xl border border-sky-200/10 bg-slate-950/75 p-4 backdrop-blur-xs">
              <RaceTrackView
                participants={liveParticipants}
                results={results}
                winnerUserId={winnerUserId}
                roomStatus={room?.status}
                promptText={activeText}
                displayNow={visualNow}
                roomStartedAt={roomStartedAt}
              />
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
                <RaceLeaderboard participants={participants} />
              </div>
            </div>
          </div>

          <div className="w-12" />
        </div>

        <div className="pointer-events-auto mt-2 flex flex-col gap-2">
          {!isConnected ? (
            <p className="rounded-lg border border-amber-200/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Reconnecting to race server...
            </p>
          ) : null}

          {errorMessage ? (
            <button
              type="button"
              onClick={clearError}
              className="rounded-lg border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-left text-xs text-rose-100 cursor-pointer"
            >
              {errorMessage} (click to dismiss)
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
