import { FriendPlayList } from "@/share/components/friend-play-list";

import { ProfileFriend } from "../types";
import { RefreshButton } from "./RefreshButton";

interface FriendCircleSectionProps {
  friends: ProfileFriend[];
  incomingRequests: ProfileFriend[];
  outgoingRequests: ProfileFriend[];
  onRemoveFriend: (friendUserId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string, successMessage: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function FriendCircleSection({
  friends,
  incomingRequests,
  outgoingRequests,
  onRemoveFriend,
  onAcceptRequest,
  onDeleteRequest,
  onRefresh,
  isRefreshing,
}: FriendCircleSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 pb-2">
        <h2 className="text-lg font-bold text-white">Friend Circle</h2>
        <RefreshButton
          onClick={onRefresh}
          isRefreshing={isRefreshing}
          label="Refresh friend circle"
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr]">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Friends</h3>
          <div className="mt-3">
            <FriendPlayList friends={friends} onRemove={onRemoveFriend} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Incoming</h3>
          <div className="mt-3 space-y-3">
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No incoming requests.</p>
            ) : (
              incomingRequests.map((request) => (
                <div key={request.friendshipId} className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">
                  <p className="font-semibold text-white">{request.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{request.tagline || request.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onAcceptRequest(request.friendshipId)}
                      className="cursor-pointer rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onDeleteRequest(request.friendshipId, "Friend request removed.")
                      }
                      className="cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4 md:col-span-2 xl:col-span-1">
          <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Outgoing</h3>
          <div className="mt-3 space-y-3">
            {outgoingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No outgoing requests.</p>
            ) : (
              outgoingRequests.map((request) => (
                <div key={request.friendshipId} className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">
                  <p className="font-semibold text-white">{request.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{request.tagline || request.email}</p>
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRequest(request.friendshipId, "Outgoing request cancelled.")
                    }
                    className="mt-3 cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
