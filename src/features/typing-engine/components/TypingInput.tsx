"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_TEXT, TEST_DURATION } from "../constants/typingConfig";
import { useTimer } from "../hooks/useTimer";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { TextRenderer } from "./TextRenderer";
import { TypingStats } from "./TypingStats";

interface TypingInputProps {
  text?: string;
  durationSeconds?: number;
}

export function TypingInput({
  text = DEFAULT_TEXT,
  durationSeconds = TEST_DURATION,
}: TypingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { elapsedMs, isFinished, startTimer, resetTimer } = useTimer({
    durationSeconds,
  });

  const { currentIndex, mistakes, typedCharacters, handleKeyDown, resetTyping } = useTypingEngine(text, {
    onFirstInput: startTimer,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleReset = () => {
    resetTyping();
    resetTimer();
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label="Typing engine"
      className="space-y-6 rounded-[1.4rem] border border-sky-200/20 bg-[linear-gradient(140deg,rgba(15,23,42,0.82),rgba(10,15,27,0.78))] p-4 sm:p-6"
    >
      <TextRenderer
        text={text}
        typedCharacters={typedCharacters}
        currentIndex={currentIndex}
      />

      <div className="space-y-3">
        <label
          htmlFor="typing-engine-input"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300"
        >
          Start typing below
        </label>
        <input
          id="typing-engine-input"
          ref={inputRef}
          aria-label="Typing input"
          value=""
          onKeyDown={handleKeyDown}
          onChange={() => {
            // Controlled as empty to capture keydown only.
          }}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-cyan-300/35 bg-slate-950/85 px-4 py-3 text-base text-white outline-none ring-cyan-300 transition placeholder:text-slate-500 focus-visible:border-cyan-200 focus-visible:ring-2"
          placeholder="Type here to begin the test"
        />
      </div>

      <TypingStats
        text={text}
        typedCharacters={typedCharacters}
        mistakes={mistakes}
        elapsedMs={elapsedMs}
      />

      <button
        type="button"
        onClick={handleReset}
        className="inline-flex w-fit rounded-xl border border-slate-300/25 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
      >
        Reset
      </button>

      <p className="text-sm text-slate-300">
        Status:{" "}
        <span className="font-semibold text-cyan-200">
          {isFinished ? "Finished" : "Running"}
        </span>
      </p>
    </section>
  );
}
