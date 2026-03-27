import { api } from "@/share/servies/api";
import {
  CreateRoomResponse,
  GetRoomResponse,
  JoinRoomResponse,
} from "../types/multiplayerTypes";

export interface CreateRoomPayload {
  promptText?: string;
}

function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function createRoomApi(
  payload: CreateRoomPayload,
  token: string
): Promise<CreateRoomResponse> {
  const response = await api.post<CreateRoomResponse>("/multiplayer/rooms", payload, {
    headers: authHeader(token),
  });

  return response.data;
}

export async function joinRoomApi(roomId: string, token: string): Promise<JoinRoomResponse> {
  const response = await api.post<JoinRoomResponse>(
    `/multiplayer/rooms/${roomId}/join`,
    {},
    {
      headers: authHeader(token),
    }
  );

  return response.data;
}

export async function getRoomApi(roomId: string, token: string): Promise<GetRoomResponse> {
  const response = await api.get<GetRoomResponse>(`/multiplayer/rooms/${roomId}`, {
    headers: authHeader(token),
  });

  return response.data;
}
