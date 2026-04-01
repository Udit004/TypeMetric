"use client";

import { useState, useTransition } from "react";

import { getLeaderboardApi } from "../services/leaderboardService";
import { LeaderboardBoard, LeaderboardResponse } from "../types";

interface LeaderboardPageClientProps {
  initialData: LeaderboardResponse | null;
  initialError: string | null;
}

const BOARD_OPTIONS: { key: LeaderboardBoard; label: string }[] = [
  { key: "combined", label: "Combined" },
  { key: "solo", label: "Single-player" },
  { key: "multiplayer", label: "Multiplayer" },
];

function formatAccuracy(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatWpm(value: number): string {
  return value.toFixed(1);
}

function formatSourceMode(value: LeaderboardResponse["entries"][number]["sourceMode"]): string {
  return value === "single-player" ? "Single-player" : "Multiplayer";
}

export function LeaderboardPageClient({
  initialData,
  initialError,
}: LeaderboardPageClientProps) {
  const [activeBoard, setActiveBoard] = useState<LeaderboardBoard>(
    initialData?.board ?? "combined"
  );
  const [leaderboards, setLeaderboards] = useState<
    Partial<Record<LeaderboardBoard, LeaderboardResponse>>
  >(initialData ? { [initialData.board]: initialData } : {});
  const [errors, setErrors] = useState<Partial<Record<LeaderboardBoard, string>>>(
    initialError ? { combined: initialError } : {}
  );
  const [loadingBoard, setLoadingBoard] = useState<LeaderboardBoard | null>(null);
  const [, startTransition] = useTransition();

  const activeLeaderboard = leaderboards[activeBoard] ?? null;
  const activeError = errors[activeBoard] ?? null;

  async function loadBoard(board: LeaderboardBoard): Promise<void> {
    setLoadingBoard(board);

    try {
      const data = await getLeaderboardApi(board);
      setLeaderboards((current) => ({
        ...current,
        [board]: data,
      }));
      setErrors((current) => {
        const next = { ...current };
        delete next[board];
        return next;
      });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [board]:
          error instanceof Error ? error.message : "Failed to load leaderboard",
      }));
    } finally {
      setLoadingBoard((current) => (current === board ? null : current));
    }
  }

  function handleBoardChange(board: LeaderboardBoard): void {
    startTransition(() => {
      setActiveBoard(board);
    });

    if (leaderboards[board] || loadingBoard === board) {
      return;
    }

    void loadBoard(board);
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {BOARD_OPTIONS.map((option) => {
            const isActive = option.key === activeBoard;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleBoardChange(option.key)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/14 text-cyan-100"
                    : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-cyan-300/25 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {loadingBoard === activeBoard ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : null}
      </div>

      {activeError && !activeLeaderboard ? (
        <div className="rounded-3xl border border-rose-300/20 bg-rose-400/8 px-5 py-8 text-center">
          <p className="text-lg font-semibold text-white">Could not load leaderboard.</p>
          <p className="mt-2 text-sm text-rose-100/85">{activeError}</p>
        </div>
      ) : null}

      {activeLeaderboard && activeLeaderboard.entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 bg-slate-950/60 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">No leaderboard entries yet.</p>
        </div>
      ) : null}

      {activeLeaderboard && activeLeaderboard.entries.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/72">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/8 bg-slate-900/70">
                <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-4 md:px-5">Rank</th>
                  <th className="px-4 py-4 md:px-5">Player</th>
                  <th className="px-4 py-4 md:px-5">WPM</th>
                  <th className="px-4 py-4 md:px-5">Accuracy</th>
                  <th className="px-4 py-4 md:px-5">Mistakes</th>
                  <th className="px-4 py-4 md:px-5">Source</th>
                </tr>
              </thead>

              <tbody>
                {activeLeaderboard.entries.map((entry) => (
                  <tr
                    key={`${entry.userId}-${entry.sourceId}`}
                    className="border-b border-white/6 text-sm text-slate-200 last:border-b-0"
                  >
                    <td className="px-4 py-4 font-bold text-white md:px-5">
                      #{entry.rank}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white md:px-5">
                      {entry.name}
                    </td>
                    <td className="px-4 py-4 text-cyan-200 md:px-5">
                      {formatWpm(entry.bestWpm)}
                    </td>
                    <td className="px-4 py-4 text-emerald-200 md:px-5">
                      {formatAccuracy(entry.accuracy)}
                    </td>
                    <td className="px-4 py-4 md:px-5">{entry.mistakes}</td>
                    <td className="px-4 py-4 md:px-5">
                      {formatSourceMode(entry.sourceMode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
