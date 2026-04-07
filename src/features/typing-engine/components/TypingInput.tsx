"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TEXT,
  TEST_DURATION,
  getRandomTypingText,
} from "../constants/typingConfig";
import { useTimer } from "../hooks/useTimer";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { calculateAccuracy, calculateWPM } from "../lib/metrics";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import { saveTypingSessionApi } from "../services/typingSessionService";
import type { CompletionReason, SaveTypingSessionPayload } from "../types/typingSession";
import { TextRenderer } from "./TextRenderer";
import { TypingStats } from "./TypingStats";
import { RunnerGame } from "./RunnerGame";
import { useAuth } from "@/share/hooks/useAuth";

interface TypingInputProps {
  text?: string;
  durationSeconds?: number;
}

export function TypingInput({
  text,
  durationSeconds = TEST_DURATION,
}: TypingInputProps) {
  const { isAuthenticated, token } = useAuth();
  const hasCustomText = typeof text === "string" && text.trim().length > 0;
  const [activeText, setActiveText] = useState(() =>
    hasCustomText ? text : DEFAULT_TEXT
  );
  const resolvedText = hasCustomText ? text : activeText;
  const [hasSavedCurrentSession, setHasSavedCurrentSession] = useState(false);

  const { elapsedMs, isFinished, startTimer, resetTimer } = useTimer({
    durationSeconds,
  });

  const { currentIndex, mistakes, typedCharacters, handleKeyDown, resetTyping } =
    useTypingEngine(resolvedText, {
      onFirstInput: startTimer,
    });

  const parsedText = useMemo(() => parseTextToCharacters(resolvedText), [resolvedText]);
  const correctCharacters = useMemo(
    () =>
      typedCharacters.reduce((count, typedChar, index) => {
        return isCharacterCorrect(typedChar, parsedText[index] ?? "") ? count + 1 : count;
      }, 0),
    [parsedText, typedCharacters]
  );

  const isTextCompleted = currentIndex >= parsedText.length;
  const isSessionCompleted = isFinished || isTextCompleted;

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

  useEffect(() => {
    const shouldSave =
      isSessionCompleted &&
      !hasSavedCurrentSession &&
      isAuthenticated &&
      Boolean(token) &&
      typedCharacters.length > 0;

    if (!shouldSave || !token) {
      return;
    }

    const saveSession = async () => {
      const completionReason: CompletionReason = isFinished
        ? "time_up"
        : "text_completed";

      const payload: SaveTypingSessionPayload = {
        promptText: resolvedText,
        typedText: typedCharacters.join(""),
        totalCharacters: parsedText.length,
        typedCharactersCount: typedCharacters.length,
        correctCharacters,
        mistakes,
        accuracy: calculateAccuracy(correctCharacters, typedCharacters.length),
        wpm: calculateWPM(typedCharacters.length, elapsedMs),
        elapsedMs,
        durationSeconds,
        completionReason,
      };

      try {
        await saveTypingSessionApi(payload, token);
        setHasSavedCurrentSession(true);
      } catch (error) {
        console.error("Failed to save typing session", error);
      }
    };

    void saveSession();
  }, [
    correctCharacters,
    durationSeconds,
    elapsedMs,
    hasSavedCurrentSession,
    isAuthenticated,
    isFinished,
    isSessionCompleted,
    mistakes,
    parsedText.length,
    resolvedText,
    token,
    typedCharacters,
  ]);

  const handleReset = () => {
    if (!hasCustomText) {
      setActiveText((previousText) => getRandomTypingText(previousText));
    }

    setHasSavedCurrentSession(false);
    resetTyping();
    resetTimer();
  };

  // Calculate current WPM
  const currentWpm = useMemo(
    () => calculateWPM(typedCharacters.length, elapsedMs),
    [elapsedMs, typedCharacters.length]
  );

  return (
    <section
      aria-label="Typing engine"
      className="space-y-6 rounded-[1.4rem]  bg-[linear-gradient(140deg,rgba(15,23,42,0.82),rgba(10,15,27,0.78))] p-4 sm:p-6"
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

      {/* Phaser Runner Game Component - Shows visual representation of typing speed */}
      <RunnerGame wpm={currentWpm} isActive={!isSessionCompleted} />
    </section>
  );
}
