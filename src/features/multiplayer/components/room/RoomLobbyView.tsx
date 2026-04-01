"use client";

import { useEffect, useState } from "react";
import { MultiplayerPlayer } from "../../types/multiplayerTypes";
import { RoomLobbyScene } from "./RoomLobbyScene";
import styles from "./RoomLobbyView.module.css";

interface RoomLobbyViewProps {
  participants: MultiplayerPlayer[];
  isHost: boolean;
  canStartRace: boolean;
  onStartRace: () => void;
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
    "from-cyan-300 to-blue-500",
    "from-fuchsia-300 to-violet-500",
    "from-emerald-300 to-green-500",
    "from-amber-300 to-orange-500",
    "from-rose-300 to-red-500",
    "from-sky-300 to-indigo-500",
  ];

  const index = hashValue(userId) % avatarTones.length;
  return avatarTones[index] ?? avatarTones[0];
}

export function RoomLobbyView({
  participants,
  isHost,
  canStartRace,
  onStartRace,
}: RoomLobbyViewProps) {
  const lobbyTitle = "Ready Check Arena";
  const lobbyDescription = "All players wait here before each round. Prompt is hidden until the race starts.";

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border border-cyan-200/20 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-4 sm:p-5">
      {/* <div
        className={`relative overflow-hidden rounded-xl border border-cyan-100/20 bg-slate-950/60 p-4 ${styles.enterBase} ${isVisible ? styles.visible : ""}`}
      >
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/90">Lobby</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{lobbyTitle}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-300">
          {lobbyDescription}
        </p>
      </div> */}

      <div
        className={`relative overflow-hidden rounded-xl border border-cyan-200/25 bg-[linear-gradient(140deg,#020617_0%,#0b1120_36%,#062135_100%)] ${styles.enterScene} ${isVisible ? styles.visible : ""}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.23),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.21),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(45,212,191,0.18),transparent_46%)]" />
        <RoomLobbyScene
          participants={participants}
          title={lobbyTitle}
          description={lobbyDescription}
        />
      </div>

      {/* <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${styles.cardsGrid}`}>
        {participants.map((participant) => (
          <article
            key={participant.userId}
            className={`group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 p-3 ${styles.enterCard} ${isVisible ? styles.visible : ""}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-linear-to-r from-cyan-400/10 to-emerald-400/10" />
            <div className="relative flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-linear-to-br text-sm font-black text-slate-950 ${getAvatarToneClass(participant.userId)}`}
              >
                {getInitials(participant.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{participant.name}</p>
                <p className="text-[11px] text-slate-300">
                  {participant.isHost ? "Host" : "Player"} • {participant.isConnected ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div> */}

      <div
        className={`rounded-xl border border-white/10 bg-slate-900/60 p-3 ${styles.enterCta} ${isVisible ? styles.visibleCta : ""}`}
      >
        {isHost ? (
          <button
            type="button"
            onClick={onStartRace}
            disabled={!canStartRace}
            className="cursor-pointer rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
          >
            {canStartRace ? "Start Race" : "Need at least 2 players"}
          </button>
        ) : (
          <p className="text-xs text-slate-300">Waiting for host to start the next race.</p>
        )}
      </div>
    </section>
  );
}
