import { api } from "@/share/servies/api";
import { AxiosError } from "axios";
import {
  CreateRoomResponse,
  GetRoomResponse,
  JoinRoomResponse,
  RoomVoiceTokenResponse,
} from "../types/multiplayerTypes";

export interface CreateRoomPayload {
  promptText?: string;
}

function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function toApiError(error: unknown, fallbackMessage: string): Error {
  const axiosError = error as AxiosError<{ message?: string }>;
  const apiMessage = axiosError.response?.data?.message;

  if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
    return new Error(apiMessage);
  }

  return new Error(fallbackMessage);
}

export async function createRoomApi(
  payload: CreateRoomPayload,
  token: string
): Promise<CreateRoomResponse> {
  try {
    const response = await api.post<CreateRoomResponse>("/multiplayer/rooms", payload, {
      headers: authHeader(token),
    });

    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create room");
  }
}

export async function joinRoomApi(roomId: string, token: string): Promise<JoinRoomResponse> {
  try {
    const response = await api.post<JoinRoomResponse>(
      `/multiplayer/rooms/${roomId}/join`,
      {},
      {
        headers: authHeader(token),
      }
    );

    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to join room");
  }
}

export async function getRoomApi(roomId: string, token: string): Promise<GetRoomResponse> {
  try {
    const response = await api.get<GetRoomResponse>(`/multiplayer/rooms/${roomId}`, {
      headers: authHeader(token),
    });

    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch room");
  }
}

export async function getRoomVoiceTokenApi(
  roomId: string,
  token: string
): Promise<RoomVoiceTokenResponse> {
  try {
    const response = await api.get<RoomVoiceTokenResponse>(
      `/multiplayer/rooms/${roomId}/voice-token`,
      {
        headers: authHeader(token),
      }
    );

    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to get voice token");
  }
}
