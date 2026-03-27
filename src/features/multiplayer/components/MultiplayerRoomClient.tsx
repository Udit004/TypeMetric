"use client";

import { useEffect, useState } from "react";
import { MultiplayerRaceView } from "@/features/multiplayer/components/MultiplayerRaceView";
import { RoomAuthModal } from "@/features/multiplayer/components/RoomAuthModal";
import { useAuth } from "@/share/hooks/useAuth";

interface MultiplayerRoomClientProps {
  roomId: string;
}

export function MultiplayerRoomClient({ roomId }: MultiplayerRoomClientProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRoom, setShowRoom] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setShowRoom(true);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <section className="rounded-2xl border border-sky-200/20 bg-slate-950/40 p-6 text-slate-300">
          Checking session...
        </section>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && <RoomAuthModal roomId={roomId} />}
      {showRoom && <MultiplayerRaceView roomId={roomId} />}
    </>
  );
}
