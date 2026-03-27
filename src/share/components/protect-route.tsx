"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuth } from "@/share/hooks/useAuth";

interface ProtectRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectRoute({
  children,
  redirectTo = "/",
}: ProtectRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-200">
        Checking session...
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
