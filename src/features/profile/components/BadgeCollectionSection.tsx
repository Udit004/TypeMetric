"use client";

import React from "react";

import type { PublicBadgeView } from "../types";

type Props = {
  badges: PublicBadgeView[];
};

function rarityColor(rarity: PublicBadgeView["rarity"]) {
  switch (rarity) {
    case "common":
      return {
        card: "bg-slate-200/10 border-slate-200/20 text-slate-100",
        bar: "bg-slate-300/70",
      };
    case "rare":
      return {
        card: "bg-sky-500/10 border-sky-400/30 text-sky-100",
        bar: "bg-sky-300/80",
      };
    case "epic":
      return {
        card: "bg-purple-500/10 border-purple-400/30 text-purple-100",
        bar: "bg-purple-300/80",
      };
    case "legendary":
      return {
        card: "bg-amber-500/10 border-amber-400/30 text-amber-100",
        bar: "bg-amber-300/80",
      };
    default:
      return {
        card: "bg-slate-200/10 border-slate-200/20 text-slate-100",
        bar: "bg-slate-300/70",
      };
  }
}

function iconFallback(badge: PublicBadgeView) {
  // Keep UI stable even if icon is missing/empty.
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-slate-200">
      {badge.category.charAt(0).toUpperCase()}
    </div>
  );
}

export function BadgeCollectionSection({ badges }: Props) {
  // Per your requirement: completed badges only.
  const completed = (badges ?? []).filter((b) => b.isCompleted);

  return (
    <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-100">Badges</h2>
        <p className="mt-1 text-sm text-slate-300">Completed achievements only</p>
      </div>

      {completed.length === 0 ? (
        <div className="text-sm text-slate-300">No completed badges yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {completed
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((badge) => {
              const color = rarityColor(badge.rarity);
              const progress =
                badge.progressTarget > 0 ? badge.progressCurrent / badge.progressTarget : 1;
              const clamped = Math.max(0, Math.min(1, progress));

              return (
                <div
                  key={badge.key}
                  className={`group rounded-xl border p-3 ${color.card} transition hover:brightness-110`}
                  title={`${badge.name}\n${badge.description}`}
                >
                  <div className="flex items-start gap-3">
                    {badge.icon ? (
                      // If backend returns an icon URL/data string, this will work.
                      // If it's not a URL, it will simply fail to load and fallback below won't render,
                      // but this keeps minimal logic for now.
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                        }}
                      />
                    ) : null}
                    {badge.icon ? null : iconFallback(badge)}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-100">
                        {badge.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-300">{badge.category}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-2 w-full ${color.bar}`}
                        style={{ width: `${Math.round(clamped * 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-300">
                      Completed
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}
