"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, token } = useAuth();
  const hasCustomText = typeof text === "string" && text.trim().length > 0;
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await panel.requestFullscreen();
    } catch (error) {
      console.error("Failed to toggle fullscreen", error);
    }
  };

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
      ref={panelRef}
      aria-label="Typing engine"
      className={`relative flex min-h-136 flex-col gap-6 overflow-hidden rounded-[1.4rem] bg-[linear-gradient(140deg,rgba(15,23,42,0.82),rgba(10,15,27,0.78))] p-4 sm:min-h-144 sm:p-6 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen items-center justify-center overflow-hidden rounded-none p-4 sm:p-6 lg:p-8"
          : ""
      }`}
    >
      <RunnerGame
        wpm={currentWpm}
        isActive={!isSessionCompleted}
        hasStartedTyping={typedCharacters.length > 0}
        isFullscreen={isFullscreen}
        asBackground
      />

      <div className="pointer-events-none absolute inset-0 z-1 bg-slate-950/35" />

      <button
        type="button"
        onClick={handleToggleFullscreen}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
      >
        {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>

      <div className={`relative z-10 ${isFullscreen ? "mx-auto w-full max-w-6xl pt-10" : ""}`}>
        <TextRenderer
          text={resolvedText}
          typedCharacters={typedCharacters}
          currentIndex={currentIndex}
          isFinished={isFinished}
          onRestart={handleReset}
        />
      </div>

      <p className={`relative z-10 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 ${isFullscreen ? "text-center" : ""}`}>
        Press any key to start typing
      </p>

      <div className={`relative z-10 ${isFullscreen ? "mx-auto w-full max-w-6xl" : ""}`}>
        <TypingStats
          text={resolvedText}
          typedCharacters={typedCharacters}
          mistakes={mistakes}
          elapsedMs={elapsedMs}
        />
      </div>
    </section>
  );
}
