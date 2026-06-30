import { useMemo } from "react";
import { calculateAccuracy, calculateWPM } from "../lib/metrics";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";

interface TypingStatsProps {
  text: string;
  typedCharacters: string[];
  mistakes: number;
  elapsedMs: number;
  durationSeconds?: number;
  history?: any; // unused in compact layout
  difficulty?: string;
  onDifficultyChange?: (val: string) => void;
  isSessionActive?: boolean;
}

export function TypingStats({
  text,
  typedCharacters,
  mistakes,
  elapsedMs,
  durationSeconds = 60,
  difficulty,
  onDifficultyChange,
  isSessionActive,
}: TypingStatsProps) {
  const parsedText = useMemo(() => parseTextToCharacters(text), [text]);

  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce((count, typedChar, index) => {
        return isCharacterCorrect(typedChar, parsedText[index] ?? "")
          ? count + 1
          : count;
      }, 0),
    [typedCharacters, parsedText]
  );

  const wpm = useMemo(
    () => calculateWPM(typedCharacters.length, elapsedMs),
    [typedCharacters.length, elapsedMs]
  );

  const accuracy = useMemo(
    () => calculateAccuracy(correctCharacters, typedCharacters.length),
    [correctCharacters, typedCharacters.length]
  );

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsedMs / 1000));
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(
    100,
    (typedCharacters.length / Math.max(parsedText.length, 1)) * 100
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-slate-900/60 border border-white/10 rounded-2xl p-3 backdrop-blur-md shadow-xl transition-all relative overflow-hidden">
      {/* Subtle animated gradient background for the stats bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-indigo-500/5 to-purple-500/5 bg-[length:200%_200%] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />

      {/* LEFT SECTION: Difficulty & Level */}
      <div className="relative flex items-center gap-4 pl-2 z-10 w-full sm:w-auto justify-between sm:justify-start">
        {difficulty && onDifficultyChange && (
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              disabled={isSessionActive}
              aria-label="Select difficulty"
              className="appearance-none bg-transparent text-slate-200 font-semibold text-sm outline-none pr-6 cursor-pointer disabled:opacity-50"
            >
              <option value="Easy" className="bg-slate-900">Easy</option>
              <option value="Medium" className="bg-slate-900">Medium</option>
              <option value="Hard" className="bg-slate-900">Hard</option>
            </select>
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        )}

        <div className="flex gap-1.5 items-center">
          <div className="h-1.5 w-4 sm:w-6 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          <div className="h-1.5 w-4 sm:w-6 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          <div className="h-1.5 w-4 sm:w-6 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-6 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-6 rounded-full bg-slate-700/50" />
          <span className="ml-1 sm:ml-2 text-[10px] font-bold text-slate-400 tracking-wider">1/10</span>
        </div>
      </div>

      {/* RIGHT SECTION: Stats */}
      <div className="relative flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pr-2 z-10 w-full sm:w-auto">
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-teal-400 mb-0.5">Time</span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums leading-none">{formatTime(timeLeft)}</span>
        </div>
        
        <div className="w-px h-6 bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-0.5">WPM</span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums leading-none">{Math.round(wpm)}</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-sky-400 mb-0.5">Acc</span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums leading-none">{Math.round(accuracy)}%</span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-rose-400 mb-0.5">Err</span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums leading-none">{mistakes}</span>
        </div>
        
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        
        <div className="flex flex-col items-center hidden sm:flex">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-0.5">Prog</span>
          <span className="text-base sm:text-lg font-black text-white tabular-nums leading-none">{Math.round(progressPercent)}%</span>
        </div>
      </div>
    </div>
  );
}