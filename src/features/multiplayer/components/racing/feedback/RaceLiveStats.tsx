interface RaceLiveStatsProps {
  accuracy: number;
  completedWords: number;
  mistakes: number;
  progressPercent: number;
  streak: number;
  wpm: number;
}

export function RaceLiveStats({
  accuracy,
  completedWords,
  mistakes,
  progressPercent,
  streak,
  wpm,
}: RaceLiveStatsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="race-live-stat-card">
        <p className="race-live-stat-card__label">Speed</p>
        <p className="race-live-stat-card__value">{wpm.toFixed(0)}</p>
        <p className="race-live-stat-card__meta">WPM right now</p>
      </div>
      <div className="race-live-stat-card">
        <p className="race-live-stat-card__label">Accuracy</p>
        <p className="race-live-stat-card__value">{accuracy.toFixed(0)}%</p>
        <p className="race-live-stat-card__meta">{mistakes} mistakes</p>
      </div>
      <div className="race-live-stat-card">
        <p className="race-live-stat-card__label">Words</p>
        <p className="race-live-stat-card__value">{completedWords}</p>
        <p className="race-live-stat-card__meta">clean words landed</p>
      </div>
      <div className="race-live-stat-card">
        <p className="race-live-stat-card__label">Pressure</p>
        <p className="race-live-stat-card__value">{streak}</p>
        <p className="race-live-stat-card__meta">{progressPercent.toFixed(0)}% of track</p>
      </div>
    </div>
  );
}
