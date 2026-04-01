"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { useNotifications } from "@/share/contexts/notificationContext";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatNotificationTime(sentAt: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sentAt));
}

function getNotificationCopy(notificationType: "play-request" | "room-invite"): {
  body: string;
  href: string;
  actionLabel: string;
} {
  if (notificationType === "room-invite") {
    return {
      body: "invited you directly into a race room.",
      href: "/multiplayer",
      actionLabel: "Join room",
    };
  }

  return {
    body: "sent you a play request.",
    href: "/multiplayer",
    actionLabel: "Go to multiplayer",
  };
}

export function NotificationCenter({
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const {
    notifications,
    dismissNotification,
    markAllAsRead,
    markNotificationAsRead,
  } = useNotifications();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    markAllAsRead();

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, markAllAsRead, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-200/20 bg-slate-950/95 shadow-[0_24px_70px_rgba(2,6,23,0.65)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Notifications</p>
          <p className="text-xs text-slate-400">
            {notifications.length === 0
              ? "No notifications yet."
              : `${notifications.length} notification${
                  notifications.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        {notifications.length > 0 ? (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Friend requests and race invites will show here.
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {notifications.map((notification) => {
              const copy = getNotificationCopy(notification.type);
              const href =
                notification.type === "room-invite" && notification.roomId
                  ? `/multiplayer/room/${notification.roomId}`
                  : copy.href;

              return (
                <div
                  key={notification.id}
                  className={`px-4 py-4 transition ${
                    notification.isRead ? "bg-transparent" : "bg-cyan-400/6"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        <span className="font-semibold">{notification.senderName}</span>{" "}
                        {copy.body}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatNotificationTime(notification.sentAt)}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-cyan-300" />
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={href}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        onClose();
                      }}
                      className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      {copy.actionLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={() => dismissNotification(notification.id)}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
