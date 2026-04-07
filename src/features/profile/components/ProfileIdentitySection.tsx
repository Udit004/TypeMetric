import Link from "next/link";

import { FavoriteMode, ProfileIdentity } from "../types";
import { formatDate } from "./profileFormatters";

interface ProfileIdentitySectionProps {
  profileIdentity: ProfileIdentity;
  formState: ProfileIdentity;
  setFormState: (next: ProfileIdentity) => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSaving: boolean;
}

export function ProfileIdentitySection({
  profileIdentity,
  formState,
  setFormState,
  onSave,
  isSaving,
}: ProfileIdentitySectionProps) {
  return (
    <div className="rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_24%),rgba(2,6,23,0.78)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400 text-2xl font-black text-slate-950 sm:h-24 sm:w-24 sm:text-3xl">
          {formState.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/85">Profile Hub</p>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">{profileIdentity.name}</h1>
            <p className="mt-2 break-all text-sm text-slate-300">{profileIdentity.email}</p>
            <p className="mt-2 text-sm text-slate-400">Member since {formatDate(profileIdentity.memberSince)}</p>
          </div>
          <div className="mt-4">
            <Link
              href="/multiplayer"
              className="inline-flex cursor-pointer rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Play With Friends
            </Link>
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSave}>
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
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          value={formState.avatarColor}
          onChange={(event) => setFormState({ ...formState, avatarColor: event.target.value })}
          placeholder="#22d3ee"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
