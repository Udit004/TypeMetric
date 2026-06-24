export function calculateRawWPM(totalKeystrokes: number, elapsedMs: number): number {
  const minutes = elapsedMs / 1000 / 60;
  if (minutes <= 0) return 0;
  return (totalKeystrokes / 5) / minutes;
}

export function calculateNetWPM(rawWPM: number, uncorrectedErrors: number, elapsedMs: number): number {
  const minutes = elapsedMs / 1000 / 60;
  if (minutes <= 0) return 0;
  const netWPM = rawWPM - (uncorrectedErrors / minutes);
  return Math.max(0, netWPM);
}

export function calculateWPM(charactersTyped: number, elapsedMs: number): number {
  const minutes = elapsedMs / 1000 / 60;

  if (minutes <= 0) {
    return 0;
  }

  return (charactersTyped / 5) / minutes;
}

export function calculateAccuracy(
  correctCharacters: number,
  totalCharacters: number
): number {
  if (totalCharacters <= 0) {
    return 100;
  }

  return (correctCharacters / totalCharacters) * 100;
}
