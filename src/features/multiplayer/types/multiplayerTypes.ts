export type RoomStatus = "waiting" | "countdown" | "racing" | "finished";

export interface PlayerProgress {
  typedCharacters: number;
  correctCharacters: number;
  mistakes: number;
  accuracy: number;
  wpm: number;
  finishedAt: number | null;
}

export interface MultiplayerPlayer {
  userId: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  progress: PlayerProgress;
}

export interface MultiplayerRoom {
  roomId: string;
  status: RoomStatus;
  hostId: string;
  promptText: string;
  durationSeconds: number;
  createdAt: number;
  startedAt: number | null;
  endsAt: number | null;
  participants: MultiplayerPlayer[];
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  sentAt: number;
}

export interface RaceResult {
  userId: string;
  name: string;
  rank: number;
  score: number;
  typedCharacters: number;
  correctCharacters: number;
  mistakes: number;
  accuracy: number;
  wpm: number;
  finishedAt: number | null;
}

export interface CreateRoomResponse {
  room: MultiplayerRoom;
}

export interface JoinRoomResponse {
  room: MultiplayerRoom;
}

export interface GetRoomResponse {
  room: MultiplayerRoom;
}
