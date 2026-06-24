import { useMemo } from "react";
import { calculateAccuracy, calculateWPM } from "../lib/metrics";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface TypingStatsProps {
  text: string;
  typedCharacters: string[];
  mistakes: number;
  elapsedMs: number;
  durationSeconds?: number;
  history: {
    wpm: number[];
    rawWpm: number[];
    accuracy: number[];
    mistakes: number[];
  };
}

function StatRow({ label, value, color, data }: { label: string, value: string | number, color: 'emerald' | 'rose', data: number[] }) {
  const isEmerald = color === 'emerald';
  const strokeColor = isEmerald ? '#34d399' : '#fb7185';
  const bgColor = isEmerald ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)';

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        fill: true,
        data: data,
        borderColor: strokeColor,
        backgroundColor: bgColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
    animation: {
      duration: 0 // disable animations for the tiny sparkline to save CPU and look snappier
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="w-20 h-10 relative flex-shrink-0">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}

export function TypingStats({
  text,
  typedCharacters,
  mistakes,
  elapsedMs,
  durationSeconds = 60,
  history,
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

  const timeLeft = Math.max(0, durationSeconds - Math.floor(elapsedMs / 1000));
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section
      aria-label="Typing statistics"
      className="flex flex-col rounded-2xl border border-sky-200/10 bg-slate-900/65 p-6 shadow-lg shadow-slate-950/35 backdrop-blur-md w-full space-y-6"
    >
      <div>
        <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-teal-500/80 mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          TIME LEFT
        </div>
        <div className="text-4xl font-bold text-white tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="h-px w-full bg-slate-800/50" />

      <StatRow label="WPM" value={Math.round(wpm)} color="emerald" data={history.wpm} />
      <StatRow label="ACCURACY" value={`${Math.round(accuracy)}%`} color="emerald" data={history.accuracy} />
      <StatRow label="MISTAKES" value={mistakes} color="rose" data={history.mistakes} />

      <div className="pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">CHARACTERS</div>
        <div className="text-xl font-bold text-slate-200 tracking-tight">{typedCharacters.length}/{parsedText.length}</div>
      </div>
    </section>
  );
}
