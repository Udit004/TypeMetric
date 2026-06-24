import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { calculateAccuracy } from "../lib/metrics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

interface TypingResultsProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mistakes: number;
  totalKeystrokes: number;
  totalErrors: number;
  elapsedMs: number;
  totalCharacters: number;
  typedCharactersCount: number;
  correctCharacters: number;
  history: {
    wpm: number[];
    rawWpm: number[];
    accuracy: number[];
    mistakes: number[];
  };
  text: string;
  typedCharacters: string[];
  previousSession?: { wpm: number; accuracy: number } | null;
  onRestart: () => void;
}

export function TypingResults({
  wpm,
  rawWpm,
  accuracy,
  mistakes,
  totalKeystrokes,
  totalErrors,
  elapsedMs,
  totalCharacters,
  typedCharactersCount,
  correctCharacters,
  history,
  text,
  typedCharacters,
  previousSession,
  onRestart,
}: TypingResultsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString()}:${s.toString().padStart(2, "0")}`;
  };

  const bestWpm = useMemo(() => Math.max(...history.wpm, 0), [history.wpm]);
  const averageWpm = useMemo(() => {
    if (history.wpm.length === 0) return 0;
    const sum = history.wpm.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.wpm.length);
  }, [history.wpm]);

  // Simple standard deviation for consistency
  const consistency = useMemo(() => {
    if (history.wpm.length < 2 || averageWpm === 0) return 100;
    const variance = history.wpm.reduce((acc, val) => acc + Math.pow(val - averageWpm, 2), 0) / history.wpm.length;
    const stdev = Math.sqrt(variance);
    const cv = stdev / averageWpm;
    // Cap consistency at 0-100%
    return Math.max(0, Math.round(100 - cv * 100));
  }, [history.wpm, averageWpm]);

  const correctedErrors = totalErrors - mistakes;
  const uncorrectedErrors = mistakes;
  const correctionRate = totalKeystrokes > 0 ? (correctedErrors / totalKeystrokes) * 100 : 0;

  const wpmDiff = previousSession ? wpm - previousSession.wpm : null;
  const accuracyDiff = previousSession ? accuracy - previousSession.accuracy : null;

  const lineChartData = {
    labels: history.wpm.map((_, i) => `${(i * 0.5).toFixed(1)}s`),
    datasets: [
      {
        fill: true,
        label: "Net WPM",
        data: history.wpm,
        borderColor: "#14b8a6", // teal-500
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        fill: false,
        label: "Raw WPM",
        data: history.rawWpm,
        borderColor: "#64748b", // slate-500
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        fill: false,
        label: "Errors",
        data: history.mistakes,
        borderColor: "#fb7185", // rose-400
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        labels: {
          color: "#94a3b8",
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#94a3b8",
        bodyColor: "#fff",
        borderColor: "rgba(56, 189, 248, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: "rgba(51, 65, 85, 0.2)", // slate-700
        },
        ticks: { color: "#64748b" }, // slate-500
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        ticks: { color: "#fb7185" }, // rose-400
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#64748b",
          maxTicksLimit: 8,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  const incorrectCharacters = mistakes;
  const skippedCharacters = Math.max(0, totalCharacters - typedCharactersCount);
  
  const doughnutData = {
    labels: ["Correct", "Incorrect", "Skipped"],
    datasets: [
      {
        data: [correctCharacters, incorrectCharacters, skippedCharacters],
        backgroundColor: ["#14b8a6", "#fb7185", "#6366f1"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        bodyColor: "#fff",
        borderColor: "rgba(56, 189, 248, 0.2)",
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  return (
    <div className="flex w-full flex-col gap-6 p-2 lg:p-6 mx-auto max-w-7xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Test Completed! <span className="text-2xl">🎉</span>
          </h2>
          <p className="text-slate-400 mt-1">Great job! Here are your results.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Review Mistakes
          </button>
          <button onClick={onRestart} className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.4)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Test Again
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* WPM */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 z-10">NET WPM</div>
          <div className="flex items-baseline gap-2 z-10">
            <div className="text-4xl font-bold text-white">{Math.round(wpm)}</div>
            {wpmDiff !== null && (
              <div className={`text-xs font-bold flex items-center ${wpmDiff >= 0 ? "text-teal-400" : "text-rose-400"}`}>
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {wpmDiff >= 0 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
                </svg>
                {Math.abs(Math.round(wpmDiff))}
              </div>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1 z-10">Raw WPM: {Math.round(rawWpm)}</div>
        </div>

        {/* ACCURACY */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">ACCURACY</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-white">{Math.round(accuracy)}%</div>
            {accuracyDiff !== null && (
              <div className={`text-xs font-bold flex items-center ${accuracyDiff >= 0 ? "text-teal-400" : "text-rose-400"}`}>
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {accuracyDiff >= 0 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
                </svg>
                {Math.abs(Math.round(accuracyDiff))}%
              </div>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Accuracy</div>
        </div>

        {/* TIME */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">TIME</div>
          <div className="text-4xl font-bold text-white">{formatTime(elapsedMs)}</div>
          <div className="text-xs text-slate-400 mt-1">Test Duration</div>
        </div>

        {/* MISTAKES */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">MISTAKES</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-white">{mistakes}</div>
            <div className="text-xs font-bold text-rose-400 flex items-center">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              2
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Mistakes</div>
        </div>

        {/* CHARACTERS */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex flex-col items-center justify-center relative col-span-2 lg:col-span-1">
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">CHARACTERS</div>
          <div className="text-4xl font-bold text-white">
            <span className="text-teal-400">{typedCharactersCount}</span>
            <span className="text-slate-500 text-3xl">/{totalCharacters}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Typed / Total</div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-xl p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">WPM OVER TIME</div>
          <div className="h-64 w-full relative">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Breakdown & Performance */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">ACCURACY BREAKDOWN</div>
            <div className="flex items-center justify-between h-32">
              <div className="w-32 h-32 relative">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xl font-bold text-white">{Math.round(accuracy)}%</div>
                  <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1 ml-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></div>
                    Correct
                  </div>
                  <div className="text-sm font-semibold text-white">{correctCharacters} <span className="text-slate-500 font-normal">({Math.round((correctCharacters/totalCharacters)*100)}%)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></div>
                    Incorrect
                  </div>
                  <div className="text-sm font-semibold text-white">{incorrectCharacters} <span className="text-slate-500 font-normal">({Math.round((incorrectCharacters/totalCharacters)*100)}%)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></div>
                    Skipped
                  </div>
                  <div className="text-sm font-semibold text-white">{skippedCharacters} <span className="text-slate-500 font-normal">({Math.round((skippedCharacters/totalCharacters)*100)}%)</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">PERFORMANCE SUMMARY</div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Best WPM
                </div>
                <div className="font-bold text-white">{bestWpm}</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Average WPM
                </div>
                <div className="font-bold text-white">{averageWpm}</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Total Keystrokes
                </div>
                <div className="font-bold text-white">{totalKeystrokes}</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Corrected Errors
                </div>
                <div className="font-bold text-white">{correctedErrors}</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Uncorrected Errors
                </div>
                <div className="font-bold text-white">{uncorrectedErrors}</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Consistency
                </div>
                <div className="font-bold text-white">{consistency}%</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-300">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Correction Rate
                </div>
                <div className="font-bold text-white">{Math.round(correctionRate)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Review Section */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-6 mt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">TEXT REVIEW</div>
        <div className="font-mono text-lg leading-relaxed tracking-wide break-words">
          {text.split('').map((char, index) => {
            const isTyped = index < typedCharacters.length;
            const typedChar = isTyped ? typedCharacters[index] : null;
            const isCorrect = isTyped && typedChar === char;
            const isWrong = isTyped && typedChar !== char;

            let colorClass = "text-slate-400"; // not typed/skipped
            let displayChar = char;

            if (isCorrect) {
              colorClass = "text-emerald-400";
            } else if (isWrong) {
              colorClass = "text-rose-400 bg-rose-500/20 rounded-sm";
              // If they typed a space where there's a char, show it clearly
              if (typedChar === ' ') displayChar = char; 
              // If they typed a wrong char, maybe show what they typed? 
              // The screenshot usually just colors the original text red.
            }

            return (
              <span key={index} className={colorClass}>
                {displayChar}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
