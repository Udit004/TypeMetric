"use client";

import { ReactNode } from "react";

import { Navbar } from "@/share/components/navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm ">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 ">
          <Navbar />
        </div>
      </div>
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-32 pb-10 sm:px-8">
        {children}
      </main>
    </div>
  );
}
