import axios from "axios";

import { getApiBaseUrl, api } from "@/share/servies/api";
import { LeaderboardBoard, LeaderboardResponse } from "../types";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  return "Request failed";
}

export async function getLeaderboardApi(
  board: LeaderboardBoard,
  limit = 50
): Promise<LeaderboardResponse> {
  try {
    const { data } = await api.get<LeaderboardResponse>("/leaderboard", {
      params: { board, limit },
    });

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getLeaderboardServer(
  board: LeaderboardBoard,
  limit = 50
): Promise<LeaderboardResponse> {
  const searchParams = new URLSearchParams({
    board,
    limit: String(limit),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/leaderboard?${searchParams.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch leaderboard";

    try {
      const body = (await response.json()) as { message?: string };
      message = body.message || message;
    } catch {
      // Keep the fallback message when the response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as LeaderboardResponse;
}
