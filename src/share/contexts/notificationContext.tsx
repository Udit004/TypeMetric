"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/share/hooks/useAuth";
import { buildWsUrl } from "@/share/lib/ws";
import { api } from "@/share/servies/api";

type NotificationType = "FRIEND_ONLINE" | "RECORD_BEATEN" | "BADGE_EARNED" | "SYSTEM" | "FRIEND_REQUEST" | "play-request" | "room-invite";

export interface AppNotification {
  _id: string;
  type: NotificationType;
  senderId?: string;
  senderName?: string;
  message: string;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  onlineFriendIds: string[];
  notifications: AppNotification[];
  unreadCount: number;
  sendPlayRequest: (targetUserId: string) => boolean;
  sendRoomInvite: (targetUserId: string, roomId: string) => boolean;
  dismissNotification: (id: string) => void;
  markAllAsRead: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

function parseMessage(rawData: string): { type?: string; payload?: unknown } {
  try {
    return JSON.parse(rawData) as { type?: string; payload?: unknown };
  } catch {
    return {};
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [onlineFriendIds, setOnlineFriendIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const wsUrl = useMemo(() => buildWsUrl(token), [token]);
  const visibleOnlineFriendIds = useMemo(
    () => (token ? onlineFriendIds : []),
    [onlineFriendIds, token]
  );
  const visibleNotifications = useMemo(
    () => (token ? notifications : []),
    [notifications, token]
  );

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get<{ notifications: AppNotification[] }>(
        "/notifications"
      );
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!wsUrl) {
      return;
    }

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message = parseMessage(event.data);

      if (!message.type) {
        return;
      }

      if (message.type === "notification:bootstrap") {
        const payload = message.payload as { onlineFriendIds?: string[] } | undefined;
        setOnlineFriendIds(payload?.onlineFriendIds ?? []);
        return;
      }

      if (message.type === "notification:friend-presence") {
        const payload = message.payload as
          | { userId?: string; isOnline?: boolean }
          | undefined;

        if (!payload?.userId || typeof payload.isOnline !== "boolean") {
          return;
        }

        const friendUserId = payload.userId;

        setOnlineFriendIds((current) => {
          const next = new Set(current);

          if (payload.isOnline) {
            next.add(friendUserId);
          } else {
            next.delete(friendUserId);
          }

          return Array.from(next);
        });
        return;
      }

      if (message.type === "notification:new") {
        const payload = message.payload as AppNotification | undefined;
        if (!payload?._id) return;

        setNotifications((current) => [payload as AppNotification, ...current]);
        return;
      }

      if (message.type === "notification:friend-play-request") {
        const payload = message.payload as
          | { senderUserId?: string; senderName?: string; sentAt?: number }
          | undefined;

        if (
          !payload?.senderUserId ||
          !payload.senderName ||
          typeof payload.sentAt !== "number"
        ) {
          return;
        }

        setNotifications((current) => [
          {
            _id: `${payload.senderUserId}:${payload.sentAt}`,
            type: "play-request",
            senderId: payload.senderUserId as string,
            senderName: payload.senderName as string,
            message: `${payload.senderName} wants to play!`,
            metadata: {},
            createdAt: new Date(payload.sentAt).toISOString(),
            isRead: false,
          },
          ...current,
        ]);
        return;
      }

      if (message.type === "notification:friend-room-invite") {
        const payload = message.payload as
          | {
              senderUserId?: string;
              senderName?: string;
              roomId?: string;
              sentAt?: number;
            }
          | undefined;

        if (
          !payload?.senderUserId ||
          !payload.senderName ||
          !payload.roomId ||
          typeof payload.sentAt !== "number"
        ) {
          return;
        }

        const senderUserId = payload.senderUserId;
        const senderName = payload.senderName;
        const roomId = payload.roomId;
        const sentAt = payload.sentAt;

        setNotifications((current) => [
          {
            _id: `${senderUserId}:${roomId}:${sentAt}`,
            type: "room-invite",
            senderId: senderUserId,
            senderName,
            message: `${senderName} invited you to a room!`,
            metadata: { roomId },
            createdAt: new Date(sentAt).toISOString(),
            isRead: false,
          },
          ...current,
        ]);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [wsUrl, fetchNotifications]);

  const sendPlayRequest = useCallback((targetUserId: string) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "friend:play-request",
        payload: {
          targetUserId,
        },
      })
    );

    return true;
  }, []);

  const sendRoomInvite = useCallback((targetUserId: string, roomId: string) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "friend:room-invite",
        payload: {
          targetUserId,
          roomId,
        },
      })
    );

    return true;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification._id !== id)
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true }
        )
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const unreadCount = useMemo(
    () => visibleNotifications.filter((notification) => !notification.isRead).length,
    [visibleNotifications]
  );

  const value = useMemo(
    () => ({
      onlineFriendIds: visibleOnlineFriendIds,
      notifications: visibleNotifications,
      unreadCount,
      sendPlayRequest,
      sendRoomInvite,
      dismissNotification,
      markAllAsRead,
      markNotificationAsRead,
    }),
    [
      dismissNotification,
      markAllAsRead,
      markNotificationAsRead,
      sendPlayRequest,
      sendRoomInvite,
      visibleNotifications,
      visibleOnlineFriendIds,
      unreadCount,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
