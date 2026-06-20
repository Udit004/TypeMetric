"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { useAuth } from "@/share/hooks/useAuth";
import { FavoriteMode, ProfileIdentity, ProfileStats, RacingStats } from "../types";
import { formatDate } from "./profileFormatters";
import { ProfileAvatar3DView } from "./ProfileAvatar3DView";
import { uploadMyAvatarApi } from "../services/profileService";

interface ProfileIdentitySectionProps {
  profileIdentity: ProfileIdentity;
  formState: ProfileIdentity;
  typingStats: ProfileStats;
  racingStats: RacingStats;
  setFormState: (next: ProfileIdentity) => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSaving: boolean;
}

export function ProfileIdentitySection({
  profileIdentity,
  formState,
  typingStats,
  racingStats,
  setFormState,
  onSave,
  isSaving,
}: ProfileIdentitySectionProps) {
  const { token } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [usernameCandidate, setUsernameCandidate] = useState<string>(formState.username);
  const [usernameAvailability, setUsernameAvailability] = useState<
    "unknown" | "available" | "unavailable" | "error"
  >("unknown");
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameSet, setIsUsernameSet] = useState(false);

  const [checkTimeoutId, setCheckTimeoutId] = useState<number | null>(null);

  const publicProfileUrl = `/${profileIdentity.username}`;




  function validateUsername(value: string): string | null {


    const v = value.trim();

    if (!v) return "Username is required.";
    if (v.length < 3) return "Username must be at least 3 characters.";
    if (v.length > 20) return "Username must be at most 20 characters.";
    if (!/^[a-z0-9_]+$/.test(v)) {
      return "Only lowercase letters, numbers, and underscore are allowed.";
    }

    return null;
  }

  async function onSubmitForm(event: React.FormEvent<HTMLFormElement>) {
    // Username is handled separately via the “Set username” button.
    return onSave(event);
  }


  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!token) return;

    setIsUploadingAvatar(true);
    setUploadMessage(null);

    try {
      await uploadMyAvatarApi(file, token);
      setUploadMessage("Avatar updated.");
      window.location.reload();
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_24%),rgba(2,6,23,0.78)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:items-start xl:gap-6 xl:flex-row">
        <div className="w-3xl">
          <ProfileAvatar3DView
            profileIdentity={profileIdentity}
            stats={{
              soloSessions: typingStats.sessionsCount,
              bestSoloWpm: typingStats.bestWpm,
              avgSoloAccuracy: typingStats.averageAccuracy,
              raceCount: racingStats.sessionsCount,
              bestRaceWpm: racingStats.bestWpm,
              wins: racingStats.winsCount,
              podiums: racingStats.podiumCount,
            }}
          />

          <div className="mt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              className="cursor-pointer rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-950/80 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
            </button>
            {uploadMessage ? (
              <div className="mt-2 text-xs text-cyan-200/90">{uploadMessage}</div>
            ) : null}
          </div>
        </div>

        <div className="w-full xl:max-w-3xl xl:flex-1">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/85">Profile Hub</p>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">{profileIdentity.name}</h1>
            <p className="mt-2 break-all text-sm text-slate-300">{profileIdentity.email}</p>
            <p className="mt-2 text-sm text-slate-400">
              Member since {formatDate(profileIdentity.memberSince)}
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="/multiplayer"
              className="inline-flex cursor-pointer rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Play With Friends
            </Link>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmitForm}>
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              placeholder="Name"
            />
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              value={formState.tagline}
              onChange={(event) => setFormState({ ...formState, tagline: event.target.value })}
              placeholder="Tagline"
            />
            <textarea
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2"
              rows={4}
              value={formState.bio}
              onChange={(event) => setFormState({ ...formState, bio: event.target.value })}
              placeholder="Bio"
            />
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              value={formState.country}
              onChange={(event) => setFormState({ ...formState, country: event.target.value })}
              placeholder="Country"
            />
            <select
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              title="Favorite Mode"
              value={formState.favoriteMode}
              onChange={(event) =>
                setFormState({ ...formState, favoriteMode: event.target.value as FavoriteMode })
              }
            >
              <option value="solo">Solo</option>
              <option value="multiplayer">Multiplayer</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <div className="col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  value={usernameCandidate}
                  onChange={(event) => {
                    setUsernameCandidate(event.target.value.toLowerCase().trimStart());
                    setUsernameAvailability("unknown");
                    setUsernameMessage(null);
                  }}
                  placeholder="username"
                  disabled={isUsernameSet}
                />

                <button
                  type="button"
                  disabled={
                    isSaving ||
                    isCheckingUsername ||
                    isUsernameSet ||
                    usernameAvailability !== "available"
                  }
                  className="cursor-pointer rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
                  onClick={async () => {
                    const err = validateUsername(usernameCandidate);
                    if (err) {
                      setUsernameMessage(err);
                      return;
                    }
                    if (!token) return;

                    setIsCheckingUsername(true);
                    setUsernameMessage(null);
                    try {
                      await (await import("../services/profileService")).updateMyUsernameApi(
                        usernameCandidate,
                        token
                      );
                      setIsUsernameSet(true);
                      setUsernameMessage("Username updated.");
                      window.location.reload();
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : "Failed to update username";
                      setUsernameMessage(msg);
                    } finally {
                      setIsCheckingUsername(false);
                    }
                  }}
                >
                  {isCheckingUsername ? "Setting..." : "Set username"}
                </button>
              </div>

              <div className="mt-2 text-xs">
              {usernameMessage ? (
                <span
                  className={
                    usernameAvailability === "available"
                      ? "text-emerald-300"
                      : usernameAvailability === "unavailable"
                        ? "text-rose-300"
                        : "text-slate-300"
                  }
                >
                  {usernameMessage}
                </span>
              ) : (
                <span className="text-slate-300">
                  Tip: Use 3-20 chars, lowercase a-z/0-9 and underscore.
                </span>
              )}

              </div>

              {isUsernameSet ? (
                <div className="mt-1 text-xs text-slate-400">
                  Username is locked.
                </div>
              ) : null}
            </div>


            <input
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              value={formState.avatarColor}
              onChange={(event) => setFormState({ ...formState, avatarColor: event.target.value })}
              placeholder="#22d3ee"
            />
            <button
              type="submit"
              disabled={isSaving || isCheckingUsername}
              className="cursor-pointer rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving || isCheckingUsername ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
