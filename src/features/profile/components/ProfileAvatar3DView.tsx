"use client";

import { PublicProfileIdentity } from "../types";
import { metric } from "./profileFormatters";

interface ProfileAvatar3DViewProps {
  profileIdentity: PublicProfileIdentity;
  stats: {
    soloSessions: number;
    bestSoloWpm: number;
    avgSoloAccuracy: number;
    raceCount: number;
    bestRaceWpm: number;
    wins: number;
    podiums: number;
  };
}

interface StatHudCardProps {
  label: string;
  value: string;
  accentClass: string;
}

function StatHudCard({ label, value, accentClass }: StatHudCardProps) {
  return (
    <div className="rounded-xl border border-white/12 bg-slate-950/56 px-3 py-2.5 backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}

function AvatarFallback({ name, avatarColor }: { name: string; avatarColor: string }) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),rgba(2,6,23,0.82))]"
      style={{
        background: `radial-gradient(circle at top, rgba(34,211,238,0.28), rgba(2,6,23,0.82)), linear-gradient(135deg, ${avatarColor || "#22d3ee"}33, transparent)`,
      }}
    >
      <div className="text-4xl font-black text-white/95 drop-shadow">{initial}</div>
    </div>
  );
}

export function ProfileAvatar3DView({ profileIdentity, stats }: ProfileAvatar3DViewProps) {
  const leftStats = [
    {
      label: "Solo Sessions",
      value: String(stats.soloSessions),
      accentClass: "text-white",
    },
    {
      label: "Best Solo WPM",
      value: metric(stats.bestSoloWpm),
      accentClass: "text-cyan-200",
    },
    {
      label: "Avg Solo Accuracy",
      value: `${metric(stats.avgSoloAccuracy)}%`,
      accentClass: "text-emerald-200",
    },
  ];

  const rightStats = [
    {
      label: "Race Count",
      value: String(stats.raceCount),
      accentClass: "text-white",
    },
    {
      label: "Best Race WPM",
      value: metric(stats.bestRaceWpm),
      accentClass: "text-cyan-200",
    },
    {
      label: "Wins / Podiums",
      value: `${stats.wins} / ${stats.podiums}`,
      accentClass: "text-amber-200",
    },
  ];

  return (
    <div className="w-full max-w-3xl overflow-hidden">
      <div className="relative flex h-136 w-full flex-col items-center justify-center sm:h-144 lg:h-152">
        <div className="relative z-10 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-cyan-300/35 via-emerald-300/20 to-cyan-300/0 blur-xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full overflow-hidden border border-white/15 bg-slate-950/20">
            {profileIdentity.avatarImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileIdentity.avatarImageUrl}
                alt={`${profileIdentity.username} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback name={profileIdentity.displayName || profileIdentity.name} avatarColor={profileIdentity.avatarColor} />
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-3 hidden items-center justify-between gap-4 lg:flex">
          <div className="w-full max-w-52 space-y-3">
            {leftStats.map((stat) => (
              <StatHudCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accentClass={stat.accentClass}
              />
            ))}
          </div>
          <div className="w-full max-w-52 space-y-3">
            {rightStats.map((stat) => (
              <StatHudCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accentClass={stat.accentClass}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/12 bg-slate-950/68 p-3 backdrop-blur">
            {[...leftStats, ...rightStats].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
                <p className={`mt-1 text-lg font-black ${stat.accentClass}`}>{stat.value}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Mode / Country</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">
                {profileIdentity.favoriteMode} / {profileIdentity.country || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
