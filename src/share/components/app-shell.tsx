"use client";

import { ReactNode } from "react";

import { Navbar } from "@/share/components/navbar";
import { NotificationProvider } from "@/share/contexts/notificationContext";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <NotificationProvider>
      <div className="relative min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm ">
          <div className="w-full px-3 py-3 md:px-5">
            <Navbar />
          </div>
        </div>
        <main className="relative flex min-h-screen w-full flex-col px-3 pt-30 pb-8 md:px-5">
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
