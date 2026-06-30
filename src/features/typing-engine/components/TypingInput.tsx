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
// import { RunnerGame } from "./RunnerGame";
import { useAuth } from "@/share/hooks/useAuth";
import { TypingResults } from "./TypingResults";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { TypingBackground } from "./TypingBackground";

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
  const [shareId, setShareId] = useState<string | null>(null);
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
          const res = await saveTypingSessionApi(payload, token);
          if (res.shareId) {
            setShareId(res.shareId);
          }
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
    setShareId(null);
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
        className={`relative flex min-h-136 flex-col overflow-hidden rounded-[1.4rem] p-4 sm:min-h-144 sm:p-6 ${
          isFullscreen
            ? "fixed inset-0 z-50 h-screen overflow-y-auto rounded-none p-4 sm:p-6 lg:p-8"
            : ""
        }`}
      >
        <TypingBackground />
        
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
            shareId={shareId}
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
      className={`relative flex min-h-136 flex-col gap-4 overflow-hidden rounded-[1.4rem] p-4 sm:min-h-144 sm:p-6 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen items-center justify-center overflow-hidden rounded-none p-4 sm:p-6 lg:p-8"
          : ""
      }`}
    >
      {/* Smooth Dark Animated Background */}
      <TypingBackground />

      <div className="pointer-events-none absolute inset-0 z-1 bg-slate-950/35" />

      {/* Empty space for Top Bar since we moved it to TypingStats below, but we can just let it flow. */}

      <button
        type="button"
        onClick={handleToggleFullscreen}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
      >
        {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>

      <div className={`relative z-10 flex flex-col gap-4 w-full flex-1 ${isFullscreen ? "pt-10 max-w-6xl mx-auto" : "mt-2"}`}>
        <TypingStats
          text={resolvedText}
          typedCharacters={typedCharacters}
          mistakes={mistakes}
          elapsedMs={elapsedMs}
          durationSeconds={durationSeconds}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          isSessionActive={isSessionActive}
        />
        <main className="flex-1 flex flex-col min-w-0 gap-4 mt-2">
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <TextRenderer
              text={resolvedText}
              typedCharacters={typedCharacters}
              currentIndex={currentIndex}
              isFinished={isFinished}
              onRestart={handleReset}
            />
          </div>

          <p className="mt-1 mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 text-center opacity-80">
            Press any key to start typing
          </p>
          <div className="shrink-0 flex justify-center">
            <VirtualKeyboard />
          </div>
        </main>
      </div>
    </section>
  );
}
