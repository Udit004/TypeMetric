"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_TEXT,
  TEST_DURATION,
  getRandomTypingText,
} from "../constants/typingConfig";
import { useTimer } from "../hooks/useTimer";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { calculateAccuracy, calculateWPM, calculateRawWPM, calculateNetWPM } from "../lib/metrics";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import { saveTypingSessionApi } from "../services/typingSessionService";
import type { CompletionReason, SaveTypingSessionPayload } from "../types/typingSession";
import { TextRenderer } from "./TextRenderer";
import { TypingStats } from "./TypingStats";
import { RunnerGame } from "./RunnerGame";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { useAuth } from "@/share/hooks/useAuth";
import { TypingResults } from "./TypingResults";

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
  const [difficulty, setDifficulty] = useState("Easy");

  const { elapsedMs, isFinished, startTimer, resetTimer } = useTimer({
    durationSeconds,
  });

  const { currentIndex, mistakes, typedCharacters, totalKeystrokes, totalErrors, handleKeyDown, resetTyping } =
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
  const isSessionActive = typedCharacters.length > 0 && !isSessionCompleted;

  const currentRawWpm = useMemo(
    () => calculateRawWPM(totalKeystrokes, elapsedMs),
    [elapsedMs, totalKeystrokes]
  );
  
  const currentNetWpm = useMemo(
    () => calculateNetWPM(currentRawWpm, mistakes, elapsedMs),
    [currentRawWpm, mistakes, elapsedMs]
  );
  
  // Backwards compatibility for old wpm display (now maps to Net WPM usually)
  const currentWpm = currentNetWpm;

  const currentAccuracy = useMemo(
    () => calculateAccuracy(correctCharacters, typedCharacters.length),
    [correctCharacters, typedCharacters.length]
  );

  const [history, setHistory] = useState({
    wpm: [] as number[],
    rawWpm: [] as number[],
    accuracy: [] as number[],
    mistakes: [] as number[],
  });
  
  const [previousSession, setPreviousSession] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (elapsedMs === 0) {
      setHistory({ wpm: [0], rawWpm: [0], accuracy: [100], mistakes: [0] });
      lastUpdateRef.current = 0;
      return;
    }
    
    // Update graph every ~500ms
    if (elapsedMs - lastUpdateRef.current >= 500) {
      setHistory(prev => ({
        wpm: [...prev.wpm, currentNetWpm],
        rawWpm: [...prev.rawWpm, currentRawWpm],
        accuracy: [...prev.accuracy, currentAccuracy],
        mistakes: [...prev.mistakes, mistakes],
      }));
      lastUpdateRef.current = elapsedMs;
    }
  }, [elapsedMs, currentNetWpm, currentRawWpm, currentAccuracy, mistakes]);

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
        wpm: currentNetWpm,
        elapsedMs,
        durationSeconds,
        completionReason,
      };
      try {
        const lastSessionStr = localStorage.getItem("typemetric_last_session");
        if (lastSessionStr) {
          setPreviousSession(JSON.parse(lastSessionStr));
        }
        localStorage.setItem("typemetric_last_session", JSON.stringify({
          wpm: currentNetWpm,
          accuracy: currentAccuracy
        }));
      } catch (e) {
        console.error("Local storage error:", e);
      }

      setHasSavedCurrentSession(true);

      if (isAuthenticated && token) {
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
          accuracy: currentAccuracy,
          wpm: currentNetWpm,
          elapsedMs,
          durationSeconds,
          completionReason,
        };

        try {
          await saveTypingSessionApi(payload, token);
        } catch (error) {
          console.error("Failed to save typing session:", error);
        }
      }
    };

    saveSession();
  }, [
    isSessionCompleted,
    hasSavedCurrentSession,
    isAuthenticated,
    token,
    resolvedText,
    typedCharacters,
    correctCharacters,
    mistakes,
    elapsedMs,
    durationSeconds,
    isFinished,
    parsedText.length,
    currentNetWpm,
    currentAccuracy
  ]);

  const handleReset = () => {
    if (!hasCustomText) {
      setActiveText((previousText) => getRandomTypingText(previousText));
    }

    setHasSavedCurrentSession(false);
    setHistory({ wpm: [0], rawWpm: [0], accuracy: [100], mistakes: [0] });
    lastUpdateRef.current = 0;
    resetTyping();
    resetTimer();
  };

  if (isSessionCompleted) {
    return (
      <section
        ref={panelRef}
        aria-label="Typing engine results"
        className={`relative flex min-h-136 flex-col overflow-hidden rounded-[1.4rem] bg-[linear-gradient(140deg,rgba(15,23,42,0.82),rgba(10,15,27,0.78))] p-4 sm:min-h-144 sm:p-6 ${
          isFullscreen
            ? "fixed inset-0 z-50 h-screen overflow-y-auto rounded-none p-4 sm:p-6 lg:p-8"
            : ""
        }`}
      >
        <div className="pointer-events-none absolute inset-0 z-1 bg-slate-950/35" />
        
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>

        <div className="relative z-10 w-full h-full flex flex-col">
          <TypingResults
            wpm={currentNetWpm}
            rawWpm={currentRawWpm}
            accuracy={currentAccuracy}
            mistakes={mistakes}
            totalKeystrokes={totalKeystrokes}
            totalErrors={totalErrors}
            elapsedMs={elapsedMs}
            totalCharacters={parsedText.length}
            typedCharactersCount={typedCharacters.length}
            correctCharacters={correctCharacters}
            history={history}
            text={resolvedText}
            typedCharacters={typedCharacters}
            previousSession={previousSession}
            onRestart={handleReset}
          />
        </div>
      </section>
    );
  }

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

      {/* Top Bar with Difficulty Dropdown and Visual Progress */}
      <div className={`relative z-10 flex items-center justify-between px-2 pt-2 ${isFullscreen ? "mx-auto w-full max-w-6xl" : ""}`}>
        <div className="relative">
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
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
        
        <div className="flex gap-1.5 ml-4 sm:ml-0">
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-slate-700/50" />
          <div className="h-1.5 w-4 sm:w-8 rounded-full bg-slate-700/50" />
        </div>
        
        <div className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wider">
          1 / 10
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggleFullscreen}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
      >
        {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>

      <div className={`relative z-10 flex flex-col lg:flex-row gap-8 w-full ${isFullscreen ? "mx-auto max-w-7xl pt-10" : "mt-6"}`}>
        <aside className="w-full lg:w-72 flex-shrink-0">
          <TypingStats
            text={resolvedText}
            typedCharacters={typedCharacters}
            mistakes={mistakes}
            elapsedMs={elapsedMs}
            durationSeconds={durationSeconds}
            history={{
              wpm: history.wpm.slice(-40),
              rawWpm: history.rawWpm.slice(-40),
              accuracy: history.accuracy.slice(-40),
              mistakes: history.mistakes.slice(-40),
            }}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 max-w-5xl">
          <TextRenderer
            text={resolvedText}
            typedCharacters={typedCharacters}
            currentIndex={currentIndex}
            isFinished={isFinished}
            onRestart={handleReset}
          />

          <p className="mt-8 mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 text-center">
            Press any key to start typing
          </p>

          <VirtualKeyboard />
        </main>
      </div>
    </section>
  );
}
