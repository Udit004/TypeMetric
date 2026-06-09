"use client";

import { useEffect, useMemo, useRef } from "react";
import { Howl } from "howler";
import { MultiplayerPlayer, RaceResult, RoomStatus } from "../../types/multiplayerTypes";
import { RaceRoomHeader } from "../racing/RaceRoomHeader";
import { RaceCompletionScene } from "./RaceCompletionScene";
import { type CompletionRow } from "./RaceCompletionPanel2D";
import { PodiumScene, type PlayerResult } from "./3d/PodiumScene";

interface RaceCompletionPanelProps {
  participants: MultiplayerPlayer[];
  results: RaceResult[];
  winnerUserId: string | null;
  isHost: boolean;
  roomId: string;
  token: string | null;
  didCopyLink: boolean;
  roomStatus: RoomStatus | undefined;
  onStartNextRace: () => void;
  onReturnToLobby: () => void;
  onCopyInviteLink: () => void;
  onLeaveRoom: () => void;
}

const SCORE_WEIGHTS = {
  wpm: 0.6,
  accuracy: 0.3,
  completion: 0.1,
  mistakePenalty: 0.35,
  finishBonus: 2,
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeScore(
  typedCharacters: number,
  wpm: number,
  accuracy: number,
  mistakes: number,
  didFinish: boolean,
  maxTypedCharacters: number
): number {
  const promptLength = Math.max(1, maxTypedCharacters);
  const completionRatio = Math.min(1, typedCharacters / promptLength);
  const completionScore = completionRatio * 100;

  const rawScore =
    wpm * SCORE_WEIGHTS.wpm +
    accuracy * SCORE_WEIGHTS.accuracy +
    completionScore * SCORE_WEIGHTS.completion -
    mistakes * SCORE_WEIGHTS.mistakePenalty +
    (didFinish ? SCORE_WEIGHTS.finishBonus : 0);

  return roundToTwo(Math.max(0, rawScore));
}

function toCompletionRows(participants: MultiplayerPlayer[], results: RaceResult[]): CompletionRow[] {
  const maxTypedCharacters = participants.reduce((maxValue, participant) => {
    return Math.max(maxValue, participant.progress.typedCharacters);
  }, 0);

  if (results.length > 0) {
    return results.map((result) => ({
      userId: result.userId,
      name: result.name,
      rank: result.rank,
      score: result.score,
      wpm: result.wpm,
      accuracy: result.accuracy,
      typedCharacters: result.typedCharacters,
      mistakes: result.mistakes,
    }));
  }

  return [...participants]
    .map((participant) => ({
      participant,
      score: computeScore(
        participant.progress.typedCharacters,
        participant.progress.wpm,
        participant.progress.accuracy,
        participant.progress.mistakes,
        participant.progress.finishedAt !== null,
        maxTypedCharacters
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      userId: item.participant.userId,
      name: item.participant.name,
      rank: index + 1,
      score: item.score,
      wpm: item.participant.progress.wpm,
      accuracy: item.participant.progress.accuracy,
      typedCharacters: item.participant.progress.typedCharacters,
      mistakes: item.participant.progress.mistakes,
    }));
}

export function RaceCompletionPanel({
  participants,
  results,
  winnerUserId,
  isHost,
  roomId,
  token,
  didCopyLink,
  roomStatus,
  onStartNextRace,
  onReturnToLobby,
  onCopyInviteLink,
  onLeaveRoom,
}: RaceCompletionPanelProps) {
  const resultMusicRef = useRef<Howl | null>(null);

  const rows = toCompletionRows(participants, results);
  const winner =
    rows.find((row) => row.userId === winnerUserId) || rows.find((row) => row.rank === 1) || null;
  const topThree = rows.filter((row) => row.rank <= 3);

  useEffect(() => {
    if (!resultMusicRef.current) {
      resultMusicRef.current = new Howl({
        src: ["/sounds/BlackDiamondBGSound.mp3"],
        loop: true,
        volume: 0.22,
        html5: true,
        preload: true,
      });
    }

    const music = resultMusicRef.current;

    if (!music.playing()) {
      music.play();
    }

    return () => {
      music.stop();
    };
  }, []);

  const handleStartNextRace = () => {
    resultMusicRef.current?.stop();
    onStartNextRace();
  };

  const podiumPlayers = useMemo<PlayerResult[]>(() => {
    return topThree.map((entry) => ({
      id: entry.userId,
      name: entry.name,
      rank: entry.rank as 1 | 2 | 3,
      score: entry.score,
      wpm: entry.wpm,
      accuracy: entry.accuracy,
    }));
  }, [topThree]);

  return (
    <section className="relative h-[750px] overflow-hidden rounded-2xl p-2 sm:h-[800px] sm:p-3 border border-sky-200/20">
      {/* 3D Canvas Scene as the background */}
      <div className="absolute inset-0 z-0">
        <PodiumScene players={podiumPlayers} className="h-full w-full" />
      </div>

      {/* Radial gradients for aesthetic enhancement */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_50%_78%,rgba(45,212,191,0.12),transparent_45%)]" />

      {/* 2D UI overlayed on top */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-4 justify-between">
        {/* Top: Header */}
        <div className="pointer-events-auto">
          <RaceRoomHeader
            roomId={roomId}
            token={token}
            didCopyLink={didCopyLink}
            isHost={isHost}
            roomStatus={roomStatus}
            onCopyInviteLink={onCopyInviteLink}
            onStartRace={onStartNextRace}
            onLeaveRoom={onLeaveRoom}
          />
        </div>

        {/* Middle: Winner details card & Results floating */}
        <div className="grid gap-4 md:grid-cols-[22rem_minmax(0,1fr)] pointer-events-none mt-4 flex-1">
          {/* Winner announcement Card */}
          <div className="pointer-events-auto rounded-xl border border-cyan-200/20 bg-slate-950/75 p-5 backdrop-blur-md self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">
              Race Complete
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              {winner ? `${winner.name} wins!` : "Race finished"}
            </h3>
            {winner ? (
              <p className="mt-1 text-sm text-cyan-100/90">
                Score {winner.score.toFixed(2)} | {winner.wpm.toFixed(1)} WPM
              </p>
            ) : null}

            {/* Actions for host / players */}
            <div className="mt-6 space-y-3">
              {isHost ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartNextRace}
                    className="w-full rounded-lg bg-cyan-400 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    Start New Race
                  </button>
                  <button
                    type="button"
                    onClick={onReturnToLobby}
                    className="w-full rounded-lg border border-cyan-200/30 bg-slate-900/80 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-slate-800 cursor-pointer"
                  >
                    Return to Lobby
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-white/5">
                  Waiting for host to start a new race...
                </p>
              )}
              <p className="text-center text-[10px] text-slate-400">
                Auto return to lobby within 60s
              </p>
            </div>
          </div>

          {/* Leaderboard/Standings Card */}
          <div className="pointer-events-auto rounded-xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-md max-h-[420px] overflow-y-auto self-start">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
              Final Standings
            </h4>
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.userId}
                  className={`flex items-center justify-between gap-4 rounded-lg border p-3 ${
                    row.userId === winnerUserId
                      ? "border-cyan-500/30 bg-cyan-500/10"
                      : "border-white/5 bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                        row.rank === 1
                          ? "bg-amber-400 text-slate-950"
                          : row.rank === 2
                            ? "bg-slate-300 text-slate-950"
                            : row.rank === 3
                              ? "bg-amber-600 text-slate-950"
                              : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {row.rank}
                    </span>
                    <span className="text-sm font-semibold text-white">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">{row.wpm.toFixed(0)} WPM</span>
                    <span className="text-slate-400">{row.accuracy.toFixed(0)}% Acc</span>
                    <span className="font-bold text-cyan-300">{row.score.toFixed(1)} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
