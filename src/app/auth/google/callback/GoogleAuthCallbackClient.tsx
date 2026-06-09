"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/share/hooks/useAuth";
import { setStoredToken } from "@/share/lib/auth-storage";

export function GoogleAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshMe } = useAuth();
  const [message, setMessage] = useState("Completing Google sign-in...");
  const [hasAuthError, setHasAuthError] = useState(false);
  const token = searchParams.get("token");
  const isError = !token || hasAuthError;

  useEffect(() => {
    if (!token) {
      return;
    }

    const finalizeGoogleAuth = async () => {
      try {
        setStoredToken(token);
        await refreshMe();
        router.replace("/");
      } catch {
        setMessage("Google sign-in failed.");
        setHasAuthError(true);
      }
    };

    void finalizeGoogleAuth();
  }, [refreshMe, router, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section
        className={`w-full max-w-md rounded-2xl border p-5 text-center shadow-2xl ${
          isError ? "border-rose-200/20 bg-rose-500/10 text-rose-100" : "border-sky-200/20 bg-slate-900/90 text-slate-100"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em]">Google Auth</p>
        <p className="mt-3 text-lg font-bold">{isError ? "Missing authentication token." : message}</p>
        {isError ? (
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to home
          </button>
        ) : null}
      </section>
    </main>
  );
}
