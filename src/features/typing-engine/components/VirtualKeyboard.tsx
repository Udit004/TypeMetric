"use client";

import { useEffect, useState } from "react";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function VirtualKeyboard() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      // Only highlight letter keys
      if (/^[A-Z]$/.test(key)) {
        setActiveKey(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (activeKey === key || /^[A-Z]$/.test(key)) {
        setActiveKey((prev) => (prev === key ? null : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeKey]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-[1.4rem] bg-slate-900/60 p-6 sm:p-8 border border-slate-800 shadow-xl">
      <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-6 uppercase">
        Keyboard
      </h3>

      <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center mb-8">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 sm:gap-3 justify-center">
            {row.map((key) => {
              const isActive = activeKey === key;
              return (
                <div
                  key={key}
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-sm sm:text-base font-semibold transition-all duration-100 ${
                    isActive
                      ? "bg-teal-500 text-teal-50 shadow-[0_0_20px_rgba(20,184,166,0.6)] scale-95"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700/50 shadow-sm"
                  }`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
          <span className="font-semibold text-slate-200">Shift + Enter</span>
          <span>to skip a word</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
          <span className="font-semibold text-slate-200">Esc</span>
          <span>to exit the test</span>
        </div>
      </div>
    </div>
  );
}
