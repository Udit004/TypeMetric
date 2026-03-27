import { MultiplayerRaceView } from "@/features/multiplayer/components/MultiplayerRaceView";

interface MultiplayerRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function MultiplayerRoomPage({
  params,
}: MultiplayerRoomPageProps) {
  const { roomId } = await params;

  return <MultiplayerRaceView roomId={roomId} />;
}
