export interface ReactionBurst {
  id: number;
  emoji: string;
  message: string;
  x: number;
  y: number;
  size: number;
  durationMs: number;
  accentClassName: string;
}

export interface MomentBanner {
  title: string;
  subtitle: string;
  accentClassName: string;
}
