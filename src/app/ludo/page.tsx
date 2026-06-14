"use client";

import { useEffect, useState } from "react";
import GodotGame from "@/features/ludo/components/GodotGame";
import { ProtectRoute } from "@/share/components/protect-route";
import { RoomVoicePanel } from "@/features/multiplayer/components/racing/RoomVoicePanel";

export default function PlayPage() {
  const [ludoRoomId, setLudoRoomId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Grab the auth token for the voice chat to authenticate
    const authToken = localStorage.getItem("typemetric_auth_token");
    setToken(authToken);

    // Listen for the Godot room join event
    (window as any).onLudoRoomJoined = (roomId: string) => {
      console.log("Joined Ludo Room ID:", roomId);
      setLudoRoomId(roomId);
    };

    return () => {
      delete (window as any).onLudoRoomJoined;
    };
  }, []);

  return (
    <ProtectRoute redirectTo="/">
      <main className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden">
        {/* Top Navigation Bar with Voice Panel */}
        <header className="w-full h-16 shrink-0 bg-slate-950 flex justify-between items-center px-6 shadow-md border-b border-slate-800/50">
          <h1 className="text-emerald-400 font-black text-xl tracking-wider">LUDO</h1>
          
          <div className="flex items-center gap-4">
            {ludoRoomId ? (
              <RoomVoicePanel roomId={ludoRoomId} token={token} compact />
            ) : (
              <span className="text-slate-500 text-sm italic">Voice chat inactive (Join a room first)</span>
            )}
          </div>
        </header>
        
        {/* Game Container (Takes up the rest of the screen safely below the header) */}
        <div className="flex-1 w-full flex items-center justify-center p-4 bg-slate-900">
          <div className="rounded-lg overflow-hidden shadow-2xl border border-slate-700/50 bg-black">
            <GodotGame />
          </div>
        </div>
      </main>
    </ProtectRoute>
  );
}
