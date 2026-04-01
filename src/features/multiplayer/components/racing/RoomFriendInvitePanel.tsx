"use client";

import { useEffect, useState } from "react";

import { ProfileFriend } from "@/features/profile/types";
import { getMyProfileApi } from "@/features/profile/services/profileService";
import { FriendPlayList } from "@/share/components/friend-play-list";

interface RoomFriendInvitePanelProps {
  roomId: string;
  token: string | null;
}

export function RoomFriendInvitePanel({
  roomId,
  token,
}: RoomFriendInvitePanelProps) {
  const [friends, setFriends] = useState<ProfileFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadFriends = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const profile = await getMyProfileApi(token);

        if (isCancelled) {
          return;
        }

        setFriends(profile.friends);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load friends";
        setErrorMessage(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadFriends();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  return (
    <section className="rounded-2xl border border-cyan-200/20 bg-slate-900/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
        Invite Friends
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading friends...</p>
      ) : errorMessage ? (
        <p className="rounded-xl border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : (
        <FriendPlayList
          friends={friends}
          actionMode="room-invite"
          roomId={roomId}
          emptyMessage="Add friends from your profile to send race invites."
        />
      )}
    </section>
  );
}
