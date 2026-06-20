
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getPublicProfileApi } from "@/features/profile/services/profileService";
import { ActivityGridSection } from "@/features/profile/components/ActivityGridSection";
import { BadgeCollectionSection } from "@/features/profile/components/BadgeCollectionSection";
import { ProfileAvatar3DView } from "@/features/profile/components/ProfileAvatar3DView";
import type { PublicProfileView } from "@/features/profile/types";

export default function PublicUsernamePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [profile, setProfile] = useState<PublicProfileView | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const activityGrid = useMemo(() => profile?.activityGrid ?? [], [profile]);
  const badges = useMemo(() => profile?.badges ?? [], [profile]);

  useEffect(() => {
    if (!username) return;

    let mounted = true;

    async function load() {
      try {
        setStatus(null);
        const data = await getPublicProfileApi(username);
        if (mounted) setProfile(data);
      } catch (err) {
        if (!mounted) return;
        setStatus(err instanceof Error ? err.message : "Failed to load profile");
        setProfile(null);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [username]);

  if (status) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100">
        {status}
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
        Loading profile...
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
      <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="sm:w-2/3">
            <ProfileAvatar3DView
              profileIdentity={profile.profile}
              stats={{
                soloSessions: profile.typingStats.sessionsCount,
                bestSoloWpm: profile.typingStats.bestWpm,
                avgSoloAccuracy: profile.typingStats.averageAccuracy,
                raceCount: profile.racingStats.sessionsCount,
                bestRaceWpm: profile.racingStats.bestWpm,
                wins: profile.racingStats.winsCount,
                podiums: profile.racingStats.podiumCount,
              }}
            />
          </div>

          <div className="flex flex-col gap-2 sm:w-1/3">
            <div className="text-lg font-semibold text-slate-100">
              @{profile.profile.username}
            </div>

            <div className="text-sm text-slate-300">
              {profile.profile.displayName || profile.profile.name}
            </div>

            {profile.profile.tagline ? (
              <div className="text-sm text-slate-300">{profile.profile.tagline}</div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs text-slate-300">Level</div>
                  <div className="text-xl font-semibold text-slate-100">
                    {profile.gamification.level}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs text-slate-300">XP</div>
                  <div className="text-xl font-semibold text-slate-100">
                    {profile.gamification.xp}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs text-slate-300">Streak</div>
                  <div className="text-xl font-semibold text-slate-100">
                    {profile.gamification.currentStreak}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs text-slate-300">Longest</div>
                  <div className="text-xl font-semibold text-slate-100">
                    {profile.gamification.longestStreak}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        {activityGrid.length === 0 ? (
          <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
            <div className="text-base font-semibold text-slate-100">
              Consistency Grid
            </div>
            <div className="mt-1 text-sm text-slate-300">No activity yet</div>
          </section>
        ) : (
          <ActivityGridSection
            title="Consistency Grid"
            subtitle="Recent typing and racing activity"
            activities={activityGrid}
          />
        )}

        {badges.length === 0 ? (
          <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
            <div className="text-base font-semibold text-slate-100">Badges</div>
            <div className="mt-1 text-sm text-slate-300">
              No completed badges yet
            </div>
          </section>
        ) : (
          <BadgeCollectionSection badges={badges} />
        )}
      </section>
    </div>
  );
}
