export type LeaderboardBoard = "combined" | "solo" | "multiplayer";
export type LeaderboardSourceMode = "single-player" | "multiplayer";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  bestWpm: number;
  accuracy: number;
  mistakes: number;
  correctCharacters: number;
  sourceMode: LeaderboardSourceMode;
  sourceId: string;
  achievedAt: string;
}

export interface LeaderboardResponse {
  board: LeaderboardBoard;
  window: "all_time";
  generatedAt: string;
  totalEntries: number;
  entries: LeaderboardEntry[];
}
