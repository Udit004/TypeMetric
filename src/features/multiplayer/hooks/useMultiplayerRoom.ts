"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildWsUrl } from "@/share/lib/ws";
import { ChatMessage, MultiplayerRoom, RaceResult } from "../types/multiplayerTypes";

interface ProgressPayload {
  typedCharacters: number;
  correctCharacters: number;
  mistakes: number;
  accuracy: number;
  wpm: number;
}

interface UseMultiplayerRoomState {
  room: MultiplayerRoom | null;
  isConnected: boolean;
  countdownSeconds: number | null;
  remainingSeconds: number | null;
  results: RaceResult[];
  winnerUserId: string | null;
  typingUserNames: string[];
  errorMessage: string | null;
  roomClosed: boolean;
  hostChangeNotification: { newHostName: string; timestamp: number } | null;
}

interface UseMultiplayerRoomActions {
  joinRoom: (roomId: string) => void;
  startRace: () => void;
  returnToLobby: () => void;
  syncRoom: (roomId: string) => void;
  leaveRoom: () => void;
  hydrateRoom: (nextRoom: MultiplayerRoom) => void;
  sendProgress: (roomId: string, payload: ProgressPayload) => void;
  sendChatMessage: (roomId: string, text: string) => void;
  sendTypingStatus: (roomId: string, isTyping: boolean) => void;
  clearError: () => void;
}

interface UseMultiplayerRoomReturn extends UseMultiplayerRoomState, UseMultiplayerRoomActions {}

function parseMessage(rawData: string): { type?: string; payload?: unknown } {
  try {
    return JSON.parse(rawData) as { type?: string; payload?: unknown };
  } catch {
    return {};
  }
}

export function useMultiplayerRoom(token: string | null): UseMultiplayerRoomReturn {
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [winnerUserId, setWinnerUserId] = useState<string | null>(null);
  const [typingUserNames, setTypingUserNames] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomClosed, setRoomClosed] = useState(false);
  const [hostChangeNotification, setHostChangeNotification] = useState<{
    newHostName: string;
    timestamp: number;
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    return buildWsUrl(token);
  }, [token]);

  const send = useCallback((type: string, payload: unknown) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify({ type, payload }));
  }, []);

  useEffect(() => {
    if (!wsUrl) {
      return;
    }

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setErrorMessage(null);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = () => {
      setErrorMessage("WebSocket connection failed");
    };

    socket.onmessage = (event) => {
      const message = parseMessage(event.data);

      if (!message.type) {
        return;
      }

      if (message.type === "error") {
        const payload = message.payload as { message?: string } | undefined;
        setErrorMessage(payload?.message || "An unexpected socket error occurred");
        return;
      }

      if (message.type === "room:created" || message.type === "room:joined" || message.type === "room:synced") {
        const payload = message.payload as { room?: MultiplayerRoom } | undefined;

        if (payload?.room) {
          setRoom(payload.room);
          setRoomClosed(false);
          setResults([]);
          setWinnerUserId(null);
          setTypingUserNames([]);
          setCountdownSeconds(null);
          setRemainingSeconds(null);
        }
        return;
      }

      if (message.type === "room:state") {
        const payload = message.payload as { room?: MultiplayerRoom } | undefined;

        if (payload?.room) {
          setRoom(payload.room);

          if (payload.room.status === "waiting") {
            setResults([]);
            setWinnerUserId(null);
            setCountdownSeconds(null);
            setRemainingSeconds(null);
          }
        }
        return;
      }

      if (message.type === "race:countdown") {
        const payload = message.payload as { remainingSeconds?: number } | undefined;
        setResults([]);
        setWinnerUserId(null);
        setCountdownSeconds(payload?.remainingSeconds ?? null);
        return;
      }

      if (message.type === "race:started") {
        const payload = message.payload as { endsAt?: number; durationSeconds?: number } | undefined;
        setCountdownSeconds(null);

        if (typeof payload?.durationSeconds === "number") {
          setRemainingSeconds(payload.durationSeconds);
        }

        if (typeof payload?.endsAt === "number") {
          const now = Date.now();
          const computed = Math.max(0, Math.ceil((payload.endsAt - now) / 1000));
          setRemainingSeconds(computed);
        }

        return;
      }

      if (message.type === "race:tick") {
        const payload = message.payload as { remainingSeconds?: number } | undefined;
        setRemainingSeconds(payload?.remainingSeconds ?? null);
        return;
      }

      if (message.type === "race:finished") {
        const payload = message.payload as {
          results?: RaceResult[];
          winnerUserId?: string | null;
        };

        setRemainingSeconds(0);
        setResults(payload.results ?? []);
        setWinnerUserId(payload.winnerUserId ?? null);
        return;
      }

      if (message.type === "room:closed") {
        setErrorMessage("Room is closed");
        setRoom(null);
        setRoomClosed(true);
        return;
      }

      if (message.type === "chat:message") {
        const payload = message.payload as { roomId?: string; message?: ChatMessage } | undefined;

        if (!payload?.roomId || !payload.message) {
          return;
        }

        const incomingMessage = payload.message;
        const incomingRoomId = payload.roomId;

        setRoom((previousRoom) => {
          if (!previousRoom || previousRoom.roomId !== incomingRoomId) {
            return previousRoom;
          }

          const nextMessages = [...(previousRoom.chatMessages ?? []), incomingMessage].slice(-100);

          return {
            ...previousRoom,
            chatMessages: nextMessages,
          };
        });
        return;
      }

      if (message.type === "chat:typing") {
        const payload = message.payload as {
          roomId?: string;
          userName?: string;
          isTyping?: boolean;
        } | undefined;

        if (!payload?.roomId || !payload.userName || typeof payload.isTyping !== "boolean") {
          return;
        }

        const typingUserName = payload.userName;

        setTypingUserNames((previous) => {
          const next = new Set(previous);

          if (payload.isTyping) {
            next.add(typingUserName);
          } else {
            next.delete(typingUserName);
          }

          return Array.from(next);
        });
        return;
      }

      if (message.type === "room:host-changed") {
        const payload = message.payload as {
          newHostName?: string;
        } | undefined;

        if (!payload?.newHostName) {
          return;
        }

        setHostChangeNotification({
          newHostName: payload.newHostName,
          timestamp: Date.now(),
        });

        // Auto-clear notification after 3 seconds
        setTimeout(() => {
          setHostChangeNotification(null);
        }, 3000);
        return;
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [wsUrl]);

  const joinRoom = useCallback(
    (roomId: string) => {
      send("room:join", { roomId });
    },
    [send]
  );

  const syncRoom = useCallback(
    (roomId: string) => {
      send("room:sync", { roomId });
    },
    [send]
  );

  const startRace = useCallback(() => {
    send("room:start", {});
  }, [send]);

  const returnToLobby = useCallback(() => {
    send("room:return-lobby", {});
  }, [send]);

  const leaveRoom = useCallback(() => {
    send("room:leave", {});
  }, [send]);

  const hydrateRoom = useCallback((nextRoom: MultiplayerRoom) => {
    setRoom(nextRoom);

    if (nextRoom.status === "waiting") {
      setCountdownSeconds(null);
      setRemainingSeconds(null);
      return;
    }

    if (nextRoom.status === "countdown") {
      setRemainingSeconds(null);
      return;
    }

    if (nextRoom.status === "finished") {
      setCountdownSeconds(null);
      setRemainingSeconds(0);
    }
  }, []);

  const sendProgress = useCallback(
    (roomId: string, payload: ProgressPayload) => {
      send("race:progress", {
        roomId,
        ...payload,
      });
    },
    [send]
  );

  const sendChatMessage = useCallback(
    (roomId: string, text: string) => {
      send("chat:send", {
        roomId,
        text,
      });
    },
    [send]
  );

  const sendTypingStatus = useCallback(
    (roomId: string, isTyping: boolean) => {
      send("chat:typing", {
        roomId,
        isTyping,
      });
    },
    [send]
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    room,
    isConnected,
    countdownSeconds,
    remainingSeconds,
    results,
    winnerUserId,
    typingUserNames,
    errorMessage,
    roomClosed,
    hostChangeNotification,
    joinRoom,
    startRace,
    returnToLobby,
    syncRoom,
    leaveRoom,
    hydrateRoom,
    sendProgress,
    sendChatMessage,
    sendTypingStatus,
    clearError,
  };
}
