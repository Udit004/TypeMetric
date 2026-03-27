"use client";

import { useEffect, useRef } from "react";
import { AuthPanel } from "@/share/components/auth-panel";
import { useAuth } from "@/share/hooks/useAuth";

interface RoomAuthModalProps {
  roomId: string;
  onAuthSuccess?: () => void;
}

export function RoomAuthModal({ roomId, onAuthSuccess }: RoomAuthModalProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const hasNotifiedAuthSuccessRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && !hasNotifiedAuthSuccessRef.current) {
      hasNotifiedAuthSuccessRef.current = true;
      onAuthSuccess?.();
    }

    if (!isAuthenticated) {
      hasNotifiedAuthSuccessRef.current = false;
    }
  }, [isAuthenticated, isLoading, onAuthSuccess]);

  const isModalOpen = !isLoading && !isAuthenticated;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70">
        <section className="rounded-2xl border border-sky-200/20 bg-slate-950/95 p-6 text-slate-300 backdrop-blur-md">
          Checking session for room {roomId}...
        </section>
      </div>
    );
  }

  return (
    <AuthPanel
      isOpen={isModalOpen}
      onClose={() => {
        // Keep the room auth modal open until the user signs in.
      }}
      initialMode="login"
    />
  );
}
