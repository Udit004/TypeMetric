"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/share/components/navbar";
import { NotificationProvider } from "@/share/contexts/notificationContext";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isRoomPage = pathname?.startsWith("/multiplayer/room/") ?? false;

  return (
    <NotificationProvider>
      <div className="relative min-h-screen">
        {!isRoomPage ? (
          <div className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm ">
            <div className="w-full px-3 py-3 md:px-5">
              <Navbar />
            </div>
          </div>
        ) : null}
        <main
          className={`relative flex min-h-screen w-full flex-col px-3 pb-8 md:px-5 ${
            isRoomPage ? "pt-0" : "pt-30"
          }`}
        >
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
