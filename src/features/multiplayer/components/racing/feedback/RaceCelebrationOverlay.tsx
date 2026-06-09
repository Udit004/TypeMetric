import { RoomStatus } from "../../../types/multiplayerTypes";
import { MomentBanner, ReactionBurst } from "./raceFeedbackTypes";

interface RaceCelebrationOverlayProps {
  countdownSeconds: number | null;
  momentBanner: MomentBanner | null;
  reactionBursts: ReactionBurst[];
  roomStatus: RoomStatus | undefined;
}

export function RaceCelebrationOverlay({
  countdownSeconds,
  momentBanner,
  reactionBursts,
  roomStatus,
}: RaceCelebrationOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {countdownSeconds !== null && roomStatus === "countdown" ? (
        <div className="absolute inset-0 grid place-items-center bg-slate-950/24 backdrop-blur-[1px]">
          <div className="race-countdown-overlay">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan-100/80">
              Race starts in
            </p>
            <p className="race-countdown-digit">{countdownSeconds}</p>
            <p className="text-xs text-slate-200/85">Hands on keyboard</p>
          </div>
        </div>
      ) : null}

      {momentBanner ? (
        <div className="absolute inset-x-0 top-20 flex justify-center px-4">
          <div className={`race-moment-banner ${momentBanner.accentClassName}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75">
              Live Reaction
            </p>
            <h3 className="mt-1 text-3xl font-black text-white">{momentBanner.title}</h3>
            <p className="mt-1 text-sm text-slate-100/90">{momentBanner.subtitle}</p>
          </div>
        </div>
      ) : null}

      {reactionBursts.map((reactionBurst) => (
        <div
          key={reactionBurst.id}
          className={`race-reaction-burst ${reactionBurst.accentClassName}`}
          style={{
            left: `${reactionBurst.x}%`,
            top: `${reactionBurst.y}%`,
            animationDuration: `${reactionBurst.durationMs}ms`,
          }}
        >
          <span style={{ fontSize: `${reactionBurst.size}px` }}>{reactionBurst.emoji}</span>
          <span className="race-reaction-burst__message">{reactionBurst.message}</span>
        </div>
      ))}
    </div>
  );
}
