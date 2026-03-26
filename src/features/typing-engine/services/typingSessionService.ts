import axios from "axios";

import { api } from "@/share/servies/api";
import {
  SavedTypingSession,
  SaveTypingSessionPayload,
} from "../types/typingSession";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  return "Request failed";
}

export async function saveTypingSessionApi(
  payload: SaveTypingSessionPayload,
  token: string
): Promise<SavedTypingSession> {
  try {
    const { data } = await api.post<{ session: SavedTypingSession }>(
      "/typing-sessions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.session;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}