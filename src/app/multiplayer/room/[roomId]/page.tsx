import { MultiplayerRoomClient } from "@/features/multiplayer/pages/MultiplayerRoomClient";

interface MultiplayerRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function MultiplayerRoomPage({
  params,
}: MultiplayerRoomPageProps) {
  const { roomId } = await params;

  return <MultiplayerRoomClient roomId={roomId} />;
}
