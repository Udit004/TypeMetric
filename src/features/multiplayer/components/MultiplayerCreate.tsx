"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createRoomApi } from "../services/multiplayerRoomService";
import { useAuth } from "@/share/hooks/useAuth";

export function MultiplayerCreate() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [promptText, setPromptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Login is required to create a room");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createRoomApi({ promptText }, token);
      router.push(`/multiplayer/room/${response.room.roomId}`);
    } catch {
      setErrorMessage("Failed to create room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-rose-200/20 bg-rose-500/10 p-6 text-rose-100">
        <h2 className="text-xl font-bold">Multiplayer is for logged-in users</h2>
        <p className="mt-2 text-sm text-rose-100/85">
          Please login from the top bar, then return here to create a room.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-lg border border-rose-100/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-100"
        >
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 backdrop-blur-md">
      <h2 className="text-2xl font-black text-white">Create Multiplayer Room</h2>
      <p className="mt-2 text-sm text-slate-300">
        Create a private room, copy the invite link, and race with your friends.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleCreate}>
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            Optional Custom Prompt
          </span>
          <textarea
            value={promptText}
            onChange={(event) => setPromptText(event.target.value)}
            rows={4}
            placeholder="Leave empty to use default race text"
            className="w-full rounded-xl border border-sky-200/20 bg-slate-900/75 p-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50"
          />
        </label>

        {errorMessage ? (
          <p className="rounded-lg border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating room..." : "Create room"}
        </button>
      </form>
    </section>
  );
}
