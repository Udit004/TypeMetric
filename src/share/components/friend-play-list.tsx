"use client";

import { ProfileFriend } from "@/features/profile/types";
import { useNotifications } from "@/share/contexts/notificationContext";

type FriendActionMode = "play-request" | "room-invite";

interface FriendPlayListProps {
  friends: ProfileFriend[];
  actionMode?: FriendActionMode;
  roomId?: string;
  emptyMessage?: string;
  onRemove?: (friendUserId: string) => void;
}

export function FriendPlayList({
  friends,
  actionMode = "play-request",
  roomId,
  emptyMessage = "No friends yet.",
  onRemove,
}: FriendPlayListProps) {
  const { onlineFriendIds, sendPlayRequest, sendRoomInvite } = useNotifications();

  const isRoomInviteMode = actionMode === "room-invite" && Boolean(roomId);
  const actionLabel = isRoomInviteMode ? "Invite to race" : "Send play request";

  if (friends.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => {
        const isOnline = onlineFriendIds.includes(friend.id);

        return (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{friend.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  isOnline
                    ? "bg-emerald-400/12 text-emerald-200"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              {isOnline ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isRoomInviteMode && roomId) {
                      sendRoomInvite(friend.id, roomId);
                      return;
                    }

                    sendPlayRequest(friend.id);
                  }}
                  title={actionLabel}
                  aria-label={actionLabel}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 8h5" />
                    <path d="M17.5 5.5v5" />
                    <path d="M10 19H5a2 2 0 0 1-2-2v-1.5a4.5 4.5 0 0 1 4.5-4.5h1A4.5 4.5 0 0 1 13 15.5V17" />
                    <circle cx="8" cy="6.5" r="3.5" />
                  </svg>
                </button>
              ) : null}
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(friend.id)}
                  className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-2.5 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
