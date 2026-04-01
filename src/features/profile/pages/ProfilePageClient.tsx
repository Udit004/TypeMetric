"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ProtectRoute } from "@/share/components/protect-route";
import { FriendPlayList } from "@/share/components/friend-play-list";
import { useAuth } from "@/share/hooks/useAuth";
import {
  acceptFriendRequestApi,
  deleteFriendRequestApi,
  getMyProfileApi,
  removeFriendApi,
  searchProfileUsersApi,
  sendFriendRequestApi,
  updateMyProfileApi,
} from "../services/profileService";
import { FavoriteMode, ProfileDashboard, ProfileIdentity, SearchUserResult } from "../types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function metric(value: number): string {
  return value.toFixed(2);
}

export function ProfilePageClient() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileDashboard | null>(null);
  const [formState, setFormState] = useState<ProfileIdentity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadProfile(activeToken: string): Promise<void> {
    setIsLoading(true);
    try {
      const data = await getMyProfileApi(activeToken);
      setProfile(data);
      setFormState(data.profile);
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadProfile(token);
  }, [token]);

  async function refreshSearch(activeToken: string): Promise<void> {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const users = await searchProfileUsersApi(searchQuery, activeToken);
    setSearchResults(users);
  }

  async function runAction(action: () => Promise<void>, successMessage: string): Promise<void> {
    if (!token) {
      return;
    }

    try {
      await action();
      await loadProfile(token);
      await refreshSearch(token);
      setStatus(successMessage);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Action failed");
    }
  }

  async function handleSearch(): Promise<void> {
    if (!token) {
      return;
    }

    try {
      await refreshSearch(token);
      if (searchQuery.trim().length >= 2 && searchResults.length === 0) {
        setStatus("No users found.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Search failed");
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!token || !formState) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateMyProfileApi(formState, token);
      setFormState(updated);
      setProfile((current) => (current ? { ...current, profile: updated } : current));
      setStatus("Profile updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProtectRoute>
      {isLoading ? (
        <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
          Loading profile...
        </section>
      ) : !profile || !formState ? (
        <section className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100">
          {status || "Profile is unavailable."}
        </section>
      ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {status ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {status}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_24%),rgba(2,6,23,0.78)] p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-slate-950"
                  style={{ backgroundColor: formState.avatarColor }}
                >
                  {formState.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/85">Profile Hub</p>
                  <h1 className="mt-3 text-3xl font-black text-white">{profile.profile.name}</h1>
                  <p className="mt-2 text-sm text-slate-300">{profile.profile.email}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Member since {formatDate(profile.profile.memberSince)}
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/multiplayer"
                      className="rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                    >
                      Play With Friends
                    </Link>
                  </div>
                </div>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} placeholder="Name" />
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" value={formState.tagline} onChange={(event) => setFormState({ ...formState, tagline: event.target.value })} placeholder="Tagline" />
                <textarea className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2" rows={4} value={formState.bio} onChange={(event) => setFormState({ ...formState, bio: event.target.value })} placeholder="Bio" />
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" value={formState.country} onChange={(event) => setFormState({ ...formState, country: event.target.value })} placeholder="Country" />
                <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" title="Favorite Mode" value={formState.favoriteMode} onChange={(event) => setFormState({ ...formState, favoriteMode: event.target.value as FavoriteMode })}>
                  <option value="solo">Solo</option>
                  <option value="multiplayer">Multiplayer</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" value={formState.avatarColor} onChange={(event) => setFormState({ ...formState, avatarColor: event.target.value })} placeholder="#22d3ee" />
                <button type="submit" disabled={isSaving} className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70">
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Solo Sessions</p><p className="mt-3 text-2xl font-black text-white">{profile.typingStats.sessionsCount}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Best Solo WPM</p><p className="mt-3 text-2xl font-black text-cyan-200">{metric(profile.typingStats.bestWpm)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Avg Solo Accuracy</p><p className="mt-3 text-2xl font-black text-emerald-200">{metric(profile.typingStats.averageAccuracy)}%</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Race Count</p><p className="mt-3 text-2xl font-black text-white">{profile.racingStats.sessionsCount}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Best Race WPM</p><p className="mt-3 text-2xl font-black text-cyan-200">{metric(profile.racingStats.bestWpm)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Wins / Podiums</p><p className="mt-3 text-2xl font-black text-amber-200">{profile.racingStats.winsCount} / {profile.racingStats.podiumCount}</p></div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <h2 className="text-lg font-bold text-white">Recent Typing Sessions</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead><tr className="border-b border-white/8 text-xs uppercase tracking-[0.16em] text-slate-400"><th className="px-3 py-3">WPM</th><th className="px-3 py-3">Accuracy</th><th className="px-3 py-3">Mistakes</th><th className="px-3 py-3">Played</th></tr></thead>
                  <tbody>
                    {profile.recentTypingSessions.length === 0 ? <tr><td className="px-3 py-4 text-slate-400" colSpan={4}>No solo sessions yet.</td></tr> : profile.recentTypingSessions.map((session) => (
                      <tr key={session.id} className="border-b border-white/6 last:border-b-0"><td className="px-3 py-3 text-cyan-200">{metric(session.wpm)}</td><td className="px-3 py-3 text-emerald-200">{metric(session.accuracy)}%</td><td className="px-3 py-3 text-slate-200">{session.mistakes}</td><td className="px-3 py-3 text-slate-400">{formatDate(session.createdAt)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <h2 className="text-lg font-bold text-white">Recent Multiplayer Races</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead><tr className="border-b border-white/8 text-xs uppercase tracking-[0.16em] text-slate-400"><th className="px-3 py-3">Rank</th><th className="px-3 py-3">WPM</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Played</th></tr></thead>
                  <tbody>
                    {profile.recentRaces.length === 0 ? <tr><td className="px-3 py-4 text-slate-400" colSpan={4}>No multiplayer races yet.</td></tr> : profile.recentRaces.map((race) => (
                      <tr key={race.id} className="border-b border-white/6 last:border-b-0"><td className="px-3 py-3 font-semibold text-white">#{race.rank}</td><td className="px-3 py-3 text-cyan-200">{metric(race.wpm)}</td><td className="px-3 py-3 text-slate-200">{metric(race.score)}</td><td className="px-3 py-3 text-slate-400">{formatDate(race.createdAt)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <h2 className="text-lg font-bold text-white">Friend Circle</h2>
              <div className="mt-4 grid gap-6 lg:grid-cols-3">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Friends</h3>
                  <div className="mt-3">
                    <FriendPlayList
                      friends={profile.friends}
                      onRemove={(friendUserId) => {
                        void runAction(
                          () => removeFriendApi(friendUserId, token!),
                          "Friend removed."
                        );
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Incoming</h3>
                  <div className="mt-3 space-y-3">
                    {profile.incomingRequests.length === 0 ? <p className="text-sm text-slate-400">No incoming requests.</p> : profile.incomingRequests.map((request) => (
                      <div key={request.friendshipId} className="rounded-2xl border border-white/8 bg-white/3 p-3">
                        <p className="font-semibold text-white">{request.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{request.tagline || request.email}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => void runAction(() => acceptFriendRequestApi(request.friendshipId, token!), "Friend request accepted.")} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">Accept</button>
                          <button type="button" onClick={() => void runAction(() => deleteFriendRequestApi(request.friendshipId, token!), "Friend request removed.")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400">Outgoing</h3>
                  <div className="mt-3 space-y-3">
                    {profile.outgoingRequests.length === 0 ? <p className="text-sm text-slate-400">No outgoing requests.</p> : profile.outgoingRequests.map((request) => (
                      <div key={request.friendshipId} className="rounded-2xl border border-white/8 bg-white/3 p-3">
                        <p className="font-semibold text-white">{request.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{request.tagline || request.email}</p>
                        <button type="button" onClick={() => void runAction(() => deleteFriendRequestApi(request.friendshipId, token!), "Outgoing request cancelled.")} className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5">Cancel</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <h2 className="text-lg font-bold text-white">Find Players</h2>
              <div className="mt-4 flex gap-2">
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by name or email" className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
                <button type="button" onClick={() => void handleSearch()} className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">Search</button>
              </div>
              <div className="mt-4 space-y-3">
                {searchResults.map((result) => (
                  <div key={result.id} className="rounded-2xl border border-white/8 bg-white/3 p-3">
                    <p className="font-semibold text-white">{result.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{result.tagline || result.email}</p>
                    <div className="mt-3">
                      {result.relationshipStatus === "none" ? <button type="button" onClick={() => void runAction(() => sendFriendRequestApi(result.id, token!), "Friend request sent.")} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">Add Friend</button> : result.relationshipStatus === "friends" ? <span className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">Friends</span> : result.relationshipStatus === "outgoing_request" ? <span className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300">Pending</span> : <div className="flex gap-2"><button type="button" onClick={() => result.requestId ? void runAction(() => acceptFriendRequestApi(result.requestId!, token!), "Friend request accepted.") : undefined} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300">Accept</button><button type="button" onClick={() => result.requestId ? void runAction(() => deleteFriendRequestApi(result.requestId!, token!), "Friend request removed.") : undefined} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5">Decline</button></div>}
                    </div>
                  </div>
                ))}
                {searchQuery.trim().length >= 2 && searchResults.length === 0 ? <p className="text-sm text-slate-400">No users found.</p> : null}
              </div>
            </section>
          </section>
        </div>
      )}
    </ProtectRoute>
  );
}
