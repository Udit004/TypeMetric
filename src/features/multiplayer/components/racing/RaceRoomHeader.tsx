import { RoomStatus } from "../../types/multiplayerTypes";
import { RoomVoicePanel } from "./RoomVoicePanel";

interface RaceRoomHeaderProps {
  roomId: string;
  token: string | null;
  didCopyLink: boolean;
  isHost: boolean;
  roomStatus: RoomStatus | undefined;
  showStartButton?: boolean;
  onCopyInviteLink: () => void;
  onStartRace: () => void;
  onLeaveRoom: () => void;
}

export function RaceRoomHeader({
  roomId,
  token,
  didCopyLink,
  isHost,
  roomStatus,
  showStartButton = true,
  onCopyInviteLink,
  onStartRace,
  onLeaveRoom,
}: RaceRoomHeaderProps) {
  return (
    <div className="rounded-2xl bg-slate-900/50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Room</p>
          <p className="text-lg font-black text-white">#{roomId}</p>
        </div>

        <RoomVoicePanel roomId={roomId} token={token} compact />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyInviteLink}
            className="cursor-pointer rounded-lg border border-white/15 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            {didCopyLink ? "Copied" : "Copy Invite Link"}
          </button>

          {showStartButton && isHost && roomStatus === "waiting" ? (
            <button
              type="button"
              onClick={onStartRace}
              className="cursor-pointer rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Race
            </button>
          ) : null}

          <button
            type="button"
            onClick={onLeaveRoom}
            className="cursor-pointer rounded-lg border border-rose-200/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
