import { MultiplayerCreate } from "@/features/multiplayer/components/MultiplayerCreate";
import { MultiplayerJoin } from "@/features/multiplayer/components/MultiplayerJoin";

export default function MultiplayerPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <MultiplayerCreate />
      <MultiplayerJoin />
    </div>
  );
}
