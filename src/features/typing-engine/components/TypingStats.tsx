import { useMemo } from "react";
import { calculateAccuracy, calculateWPM } from "../lib/metrics";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";

interface TypingStatsProps {
  text: string;
  typedCharacters: string[];
  mistakes: number;
  elapsedMs: number;
}

export function TypingStats({
  text,
  typedCharacters,
  mistakes,
  elapsedMs,
}: TypingStatsProps) {
  const parsedText = useMemo(() => parseTextToCharacters(text), [text]);

  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce((count, typedChar, index) => {
        return isCharacterCorrect(typedChar, parsedText[index] ?? "") ? count + 1 : count;
      }, 0),
    [parsedText, typedCharacters]
  );

  const wpm = useMemo(() => calculateWPM(typedCharacters.length, elapsedMs), [elapsedMs, typedCharacters.length]);
  const accuracy = useMemo(
    () => calculateAccuracy(correctCharacters, typedCharacters.length),
    [correctCharacters, typedCharacters.length]
  );

  return (
    <section
      aria-label="Typing statistics"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <div className="rounded-2xl border border-sky-200/20 bg-slate-900/65 p-3 shadow-lg shadow-slate-950/35">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">WPM</p>
        <p className="mt-1 text-xl font-bold text-white">{wpm.toFixed(2)}</p>
      </div>
      <div className="rounded-2xl border border-sky-200/20 bg-slate-900/65 p-3 shadow-lg shadow-slate-950/35">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Accuracy</p>
        <p className="mt-1 text-xl font-bold text-emerald-200">{accuracy.toFixed(2)}%</p>
      </div>
      <div className="rounded-2xl border border-sky-200/20 bg-slate-900/65 p-3 shadow-lg shadow-slate-950/35">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Time</p>
        <p className="mt-1 text-xl font-bold text-cyan-200">{(elapsedMs / 1000).toFixed(1)}s</p>
      </div>
      <div className="rounded-2xl border border-sky-200/20 bg-slate-900/65 p-3 shadow-lg shadow-slate-950/35">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Mistakes</p>
        <p className="mt-1 text-xl font-bold text-rose-200">{mistakes}</p>
      </div>
    </section>
  );
}
