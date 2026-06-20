"use client";

import React from "react";

import type { ActivityGridCell } from "../types";

type Props = {
  title: string;
  subtitle?: string;
  activities: ActivityGridCell[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function heatToIntensity(heatScore: number | null | undefined) {
  if (heatScore == null || Number.isNaN(heatScore)) return 0;
  // Normalize to 0..1 with a soft clamp.
  const normalized = heatScore / 100;
  return clamp(normalized, 0, 1);
}

function toDateKey(isoDate: string) {
  // Expect YYYY-MM-DD. Keep as-is, but defensively handle full ISO strings.
  if (!isoDate) return "";
  if (isoDate.length >= 10) return isoDate.slice(0, 10);
  return isoDate;
}

export function ActivityGridSection({ title, subtitle, activities }: Props) {
  const normalized = (activities ?? []).slice();

  // Map by date key
  const byDate = new Map<string, ActivityGridCell>();
  for (const a of normalized) {
    const key = toDateKey(a.activityDate);
    if (!key) continue;
    byDate.set(key, a);
  }

  // Determine the last date we have (fallback: today UTC)
  const allKeys = Array.from(byDate.keys()).sort(); // YYYY-MM-DD lexicographic OK
  const lastKey = allKeys.length ? allKeys[allKeys.length - 1] : toDateKey(new Date().toISOString());

  // Build last 1 year (365 days) so it can span a large horizontal area.
  const cells: ActivityGridCell[] = [];
  const last = new Date(lastKey + "T00:00:00.000Z");
  const DAYS = 365;

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(last);
    d.setUTCDate(d.getUTCDate() - i);
    const key = toDateKey(d.toISOString());
    const cell = byDate.get(key);

    if (cell) {
      cells.push(cell);
    } else {
      cells.push({
        activityDate: key,
        heatScore: 0,
        xpEarned: 0,
        completedDay: false,
        typingSessionsCount: 0,
        multiplayerRacesCount: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      });
    }
  }

  return (
    <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
      </div>

      {/* 7 rows (weekday) x N columns (weeks), using horizontal space */}
      <div className="grid grid-rows-7 grid-flow-col gap-2" style={{ gridTemplateColumns: `repeat(${Math.ceil(365 / 7)}, minmax(0, 1fr))` }}>
        {cells.map((cell) => {
          const intensity = heatToIntensity(cell.heatScore);
          const completed = !!cell.completedDay;

          // Brightness varies by daily activity. Completed days get a stronger ramp.
          const alphaBase = completed ? 0.18 : 0.06;
          const alpha = clamp(alphaBase + intensity * (completed ? 0.78 : 0.30), 0.0, 1.0);

          const bg = `rgba(56, 189, 248, ${alpha})`;

          const tooltip = [
            cell.activityDate,
            `Completed: ${completed ? "Yes" : "No"}`,
            `Heat: ${cell.heatScore ?? 0}`,
            `XP: ${cell.xpEarned ?? 0}`,
            `Typing sessions: ${cell.typingSessionsCount ?? 0}`,
            `Multiplayer races: ${cell.multiplayerRacesCount ?? 0}`,
            `Best WPM: ${cell.bestWpm ?? 0}`,
            `Best Accuracy: ${cell.bestAccuracy ?? 0}%`,
          ].join(" • ");

          return (
            <div
              key={cell.activityDate}
              title={tooltip}
              aria-label={`Activity for ${cell.activityDate}`}
              className="h-4 w-4 rounded-sm border border-white/5 transition"
              style={{ background: bg }}
            />
          );
        })}
      </div>
    </section>
  );
}
