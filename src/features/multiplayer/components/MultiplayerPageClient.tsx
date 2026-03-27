"use client";

import { ProtectRoute } from "@/share/components/protect-route";
import { MultiplayerCreate } from "@/features/multiplayer/components/MultiplayerCreate";
import { MultiplayerJoin } from "@/features/multiplayer/components/MultiplayerJoin";

export function MultiplayerPageClient() {
  return (
    <ProtectRoute>
      <div className="grid gap-5 lg:grid-cols-2">
        <MultiplayerCreate />
        <MultiplayerJoin />
      </div>
    </ProtectRoute>
  );
}
