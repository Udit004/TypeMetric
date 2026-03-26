"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TEXT,
  TEST_DURATION,
  getRandomTypingText,
} from "../constants/typingConfig";
import { useTimer } from "../hooks/useTimer";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { TextRenderer } from "./TextRenderer";
import { TypingStats } from "./TypingStats";

interface TypingInputProps {
  text?: string;
  durationSeconds?: number;
}

export function TypingInput({
  text,
  durationSeconds = TEST_DURATION,
}: TypingInputProps) {
  const hasCustomText = typeof text === "string" && text.trim().length > 0;
  const [activeText, setActiveText] = useState(() =>
    hasCustomText ? text : DEFAULT_TEXT
  );
  const resolvedText = hasCustomText ? text : activeText;

  const { elapsedMs, isFinished, startTimer, resetTimer } = useTimer({
    durationSeconds,
  });

  const { currentIndex, mistakes, typedCharacters, handleKeyDown, resetTyping } =
    useTypingEngine(resolvedText, {
      onFirstInput: startTimer,
    });

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isEditableTarget) {
        return;
      }

      const isTypingKey =
        event.key === "Backspace" ||
        (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey);

      if (isFinished) {
        if (isTypingKey) {
          event.preventDefault();
        }
        return;
      }

      handleKeyDown(event);
    };

    window.addEventListener("keydown", onWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [handleKeyDown, isFinished]);

  const handleReset = () => {
    if (!hasCustomText) {
      setActiveText((previousText) => getRandomTypingText(previousText));
    }

    resetTyping();
    resetTimer();
  };

  return (
    <section
      aria-label="Typing engine"
      className="space-y-6 rounded-[1.4rem] border border-sky-200/20 bg-[linear-gradient(140deg,rgba(15,23,42,0.82),rgba(10,15,27,0.78))] p-4 sm:p-6"
    >
      <TextRenderer
        text={resolvedText}
        typedCharacters={typedCharacters}
        currentIndex={currentIndex}
        isFinished={isFinished}
        onRestart={handleReset}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        Press any key to start typing
      </p>

      <TypingStats
        text={resolvedText}
        typedCharacters={typedCharacters}
        mistakes={mistakes}
        elapsedMs={elapsedMs}
      />
    </section>
  );
}
