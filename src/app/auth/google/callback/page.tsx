import { Suspense } from "react";

import { GoogleAuthCallbackClient } from "./GoogleAuthCallbackClient";

function GoogleAuthCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-2xl border border-sky-200/20 bg-slate-900/90 p-5 text-center text-slate-100 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em]">Google Auth</p>
        <p className="mt-3 text-lg font-bold">Completing Google sign-in...</p>
      </section>
    </main>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense fallback={<GoogleAuthCallbackFallback />}>
      <GoogleAuthCallbackClient />
    </Suspense>
  );
}
