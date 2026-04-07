"use client";

import { useEffect, useState } from "react";

import { ProtectRoute } from "@/share/components/protect-route";
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
import { ProfileDashboard, ProfileIdentity, SearchUserResult } from "../types";
import { FriendCircleSection } from "../components/FriendCircleSection";
import { PlayerSearchSection } from "../components/PlayerSearchSection";
import { ProfileIdentitySection } from "../components/ProfileIdentitySection";
import { RecentRacesSection } from "../components/RecentRacesSection";
import { RecentTypingSessionsSection } from "../components/RecentTypingSessionsSection";

export function ProfilePageClient() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileDashboard | null>(null);
  const [formState, setFormState] = useState<ProfileIdentity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingFriendCircle, setIsRefreshingFriendCircle] = useState(false);

  async function loadProfile(
    activeToken: string,
    options?: { silent?: boolean }
  ): Promise<void> {
    if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const data = await getMyProfileApi(activeToken);
      setProfile(data);
      setFormState(data.profile);
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadProfile(token);
  }, [token]);

  async function refreshSearch(activeToken: string): Promise<SearchUserResult[]> {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return [];
    }

    const users = await searchProfileUsersApi(searchQuery, activeToken);
    setSearchResults(users);
    return users;
  }

  async function runAction(
    action: (activeToken: string) => Promise<void>,
    successMessage: string
  ): Promise<void> {
    if (!token) {
      return;
    }

    try {
      await action(token);
      await loadProfile(token, { silent: true });
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
      const users = await refreshSearch(token);
      if (searchQuery.trim().length >= 2 && users.length === 0) {
        setStatus("No users found.");
      } else {
        setStatus(null);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Search failed");
    }
  }

  async function handleRefreshFriendCircle(): Promise<void> {
    if (!token) {
      return;
    }

    setIsRefreshingFriendCircle(true);
    try {
      await loadProfile(token, { silent: true });
      await refreshSearch(token);
      setStatus("Friend circle refreshed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setIsRefreshingFriendCircle(false);
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

          <section>
            <ProfileIdentitySection
              profileIdentity={profile.profile}
              formState={formState}
              typingStats={profile.typingStats}
              racingStats={profile.racingStats}
              setFormState={setFormState}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <RecentTypingSessionsSection sessions={profile.recentTypingSessions} />

            <RecentRacesSection races={profile.recentRaces} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <FriendCircleSection
              friends={profile.friends}
              incomingRequests={profile.incomingRequests}
              outgoingRequests={profile.outgoingRequests}
              onRemoveFriend={(friendUserId) => {
                void runAction(
                  (activeToken) => removeFriendApi(friendUserId, activeToken),
                  "Friend removed."
                );
              }}
              onAcceptRequest={(requestId) => {
                void runAction(
                  (activeToken) => acceptFriendRequestApi(requestId, activeToken),
                  "Friend request accepted."
                );
              }}
              onDeleteRequest={(requestId, successMessage) => {
                void runAction(
                  (activeToken) => deleteFriendRequestApi(requestId, activeToken),
                  successMessage
                );
              }}
              onRefresh={() => {
                void handleRefreshFriendCircle();
              }}
              isRefreshing={isRefreshingFriendCircle}
            />

            <PlayerSearchSection
              query={searchQuery}
              results={searchResults}
              setQuery={setSearchQuery}
              onSearch={() => {
                void handleSearch();
              }}
              onAddFriend={(targetUserId) => {
                void runAction(
                  (activeToken) => sendFriendRequestApi(targetUserId, activeToken),
                  "Friend request sent."
                );
              }}
              onAcceptRequest={(requestId) => {
                void runAction(
                  (activeToken) => acceptFriendRequestApi(requestId, activeToken),
                  "Friend request accepted."
                );
              }}
              onDeleteRequest={(requestId) => {
                void runAction(
                  (activeToken) => deleteFriendRequestApi(requestId, activeToken),
                  "Friend request removed."
                );
              }}
            />
          </section>
        </div>
      )}
    </ProtectRoute>
  );
}
