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

function StatCard({
  label,
  value,
  color,
  data,
}: {
  label: string;
  value: string | number;
  color: "emerald" | "sky" | "rose";
  data: number[];
}) {
  const colorMap = {
    emerald: {
      stroke: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      grad: "from-emerald-500/10",
    },
    sky: {
      stroke: "#38bdf8",
      bg: "rgba(56,189,248,0.12)",
      grad: "from-sky-500/10",
    },
    rose: {
      stroke: "#fb7185",
      bg: "rgba(251,113,133,0.12)",
      grad: "from-rose-500/10",
    },
  };

  const theme = colorMap[color];

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        fill: true,
        borderColor: theme.stroke,
        backgroundColor: theme.bg,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: { display: false },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative flex-1 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-5 group hover:bg-slate-800/60 transition-all duration-300">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.grad} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative flex h-full items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-500">
            {label}
          </p>

          <h2 className="mt-1 text-3xl lg:text-4xl font-black tracking-tight text-white tabular-nums">
            {value}
          </h2>
        </div>

        <div className="w-20 lg:w-24 h-12 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
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
        return isCharacterCorrect(
          typedChar,
          parsedText[index] ?? ""
        )
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
    () =>
      calculateAccuracy(
        correctCharacters,
        typedCharacters.length
      ),
    [correctCharacters, typedCharacters.length]
  );

  const timeLeft = Math.max(
    0,
    durationSeconds - Math.floor(elapsedMs / 1000)
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercent = Math.min(
    100,
    (typedCharacters.length / Math.max(parsedText.length, 1)) * 100
  );

  return (
    <section
      aria-label="Typing statistics"
      className="flex flex-col lg:flex-row gap-4 w-full items-stretch"
    >
      {/* TIME */}

      <div className="relative lg:flex-[1.3] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl">

        <div className="absolute top-0 right-0 p-8 opacity-20">
          <svg
            className="w-24 h-24 text-teal-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="relative flex flex-col justify-center h-full">
          <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-teal-400">
            TIME LEFT
          </p>

          <h1 className="mt-2 text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white tabular-nums">
            {formatTime(timeLeft)}
          </h1>
        </div>
      </div>

      <StatCard
        label="WPM"
        value={Math.round(wpm)}
        data={history.wpm}
        color="emerald"
      />

      <StatCard
        label="ACCURACY"
        value={`${Math.round(accuracy)}%`}
        data={history.accuracy}
        color="sky"
      />

      <StatCard
        label="MISTAKES"
        value={mistakes}
        data={history.mistakes}
        color="rose"
      />

      {/* PROGRESS */}

      <div className="flex-1 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-5 flex flex-col justify-center">

        <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-500">
          PROGRESS
        </p>

        <div className="flex items-end justify-between mt-3">
          <span className="text-3xl font-black text-white tabular-nums">
            {typedCharacters.length}
          </span>

          <span className="text-sm text-slate-500">
            / {parsedText.length}
          </span>
        </div>

        <div className="mt-4 h-2 rounded-full bg-slate-900 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        <div className="mt-3 text-sm text-slate-400 font-medium">
          {progressPercent.toFixed(1)}%
        </div>
      </div>
    </section>
  );
}