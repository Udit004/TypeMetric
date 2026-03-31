"use client";

import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/share/hooks/useAuth";

type Mode = "login" | "register";

interface AuthPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

export function AuthPanel({ isOpen, onClose, initialMode = "login" }: AuthPanelProps) {
  const { isLoading, login, register } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [initialMode, isOpen]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      resetForm();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-slate-950/50">
        <section className="rounded-2xl border border-white/10 bg-slate-900/95 p-5 text-sm text-slate-300 shadow-2xl w-full max-w-md">
          Loading auth session...
        </section>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-slate-950/50" onClick={onClose}>
      <section
        className="rounded-2xl border border-sky-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md w-full max-w-md mx-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                mode === "login" ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                mode === "register" ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300"
              }`}
            >
              Register
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <form className="space-y-2" onSubmit={onSubmit}>
          {mode === "register" ? (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            />
          ) : null}

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
          />

          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
          />

          {error ? <p className="text-xs text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
