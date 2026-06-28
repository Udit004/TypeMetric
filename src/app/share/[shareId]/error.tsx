"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Share page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[50%] left-[50%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="z-10 max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">
        <div className="w-16 h-16 mx-auto bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-8">
          We couldn't load this typing result. The server might be experiencing issues.
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="w-full py-3 px-6 rounded-xl font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
