"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { joinRoomApi } from "../../services/multiplayerRoomService";
import { useAuth } from "@/share/hooks/useAuth";

function normalizeRoomCode(value: string): string {
  return value.trim().replace(/^#/, "").toLowerCase();
}

function resolveRoomCode(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    const roomSegmentIndex = segments.findIndex((segment) => segment === "room");

    if (roomSegmentIndex >= 0 && segments[roomSegmentIndex + 1]) {
      return normalizeRoomCode(segments[roomSegmentIndex + 1]);
    }

    const lastSegment = segments[segments.length - 1] ?? "";
    return normalizeRoomCode(lastSegment);
  } catch {
    return normalizeRoomCode(trimmed);
  }
}

export function MultiplayerJoin() {
  const router = useRouter();
  const { token } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = resolveRoomCode(roomCode);

    if (!normalizedCode) {
      setErrorMessage("Please enter a room code.");
      return;
    }

    if (!token) {
      setErrorMessage("Login is required to join a room.");
      return;
    }

    setIsJoining(true);
    setErrorMessage(null);

    try {
      await joinRoomApi(normalizedCode, token);
      router.push(`/multiplayer/room/${normalizedCode}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Room not found or unavailable. Check the code and try again.";
      setErrorMessage(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setRoomCode(clipboardText);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Could not access clipboard. Paste manually.");
    }
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 backdrop-blur-md">
      <h2 className="text-2xl font-black text-white">Join Room</h2>
      <p className="mt-2 text-sm text-slate-300">
        Paste a room code to instantly join your friend&apos;s multiplayer race.
      </p>

      <form className="mt-6 flex flex-1 flex-col gap-4" onSubmit={handleJoin}>
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            Room Code
          </span>

          <div className="flex items-center gap-2">
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Paste room code or invite link"
              className="w-full rounded-xl border border-sky-200/20 bg-slate-900/75 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-400/70 focus:border-cyan-300/50"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="cursor-pointer rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Paste
            </button>
          </div>
        </label>

        {errorMessage ? (
          <p className="rounded-lg border border-rose-200/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isJoining}
          className="mt-auto cursor-pointer self-start rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isJoining ? "Joining..." : "Join room"}
        </button>
      </form>
    </section>
  );
}
