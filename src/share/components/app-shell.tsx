"use client";

import { ReactNode } from "react";

import { Navbar } from "@/share/components/navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8 lg:py-14">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
