"use client";

import { PodiumScene, type PlayerResult } from "@/features/multiplayer/components/result/3d/PodiumScene";
import { useMemo } from "react";

export interface RaceCompletionSceneEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  wpm?: number;
  accuracy?: number;
}

interface RaceCompletionSceneProps {
  entries: RaceCompletionSceneEntry[];
}

function isPodiumRank(rank: number): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3;
}

export function RaceCompletionScene({ entries }: RaceCompletionSceneProps) {
  const players = useMemo<PlayerResult[]>(() => {
    return entries
      .filter((entry): entry is RaceCompletionSceneEntry & { rank: 1 | 2 | 3 } => isPodiumRank(entry.rank))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3)
      .map((entry) => ({
        id: entry.userId,
        name: entry.name,
        avatarUrl: entry.avatarUrl,
        rank: entry.rank,
        score: entry.score,
        wpm: entry.wpm,
        accuracy: entry.accuracy,
      }));
  }, [entries]);

  return (
    <section className="relative mt-4 overflow-hidden rounded-xl border border-cyan-200/25 bg-[linear-gradient(140deg,#020617_0%,#0b1120_36%,#062135_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,189,248,0.23),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.21),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(45,212,191,0.18),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-cyan-200/10 to-transparent" />

      <PodiumScene players={players} />
    </section>
  );
}
