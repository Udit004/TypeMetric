import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
  durationSeconds?: number;
}

interface UseTimerReturn {
  elapsedMs: number;
  isRunning: boolean;
  isFinished: boolean;
  startTimer: () => void;
  resetTimer: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { durationSeconds } = options;
  const durationMs = durationSeconds ? durationSeconds * 1000 : null;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const isFinished = durationMs !== null && elapsedMs >= durationMs;

  const startTimer = useCallback(() => {
    if (isRunning || isFinished) {
      return;
    }

    setIsRunning(true);
  }, [isFinished, isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setElapsedMs(0);
    startTimeRef.current = null;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // TODO: Add pause/resume snapshots when timed modes are introduced.
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      return;
    }

    const tick = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const rawElapsed = now - startTimeRef.current;
      const nextElapsed = durationMs !== null ? Math.min(rawElapsed, durationMs) : rawElapsed;

      setElapsedMs(nextElapsed);

      if (durationMs !== null && nextElapsed >= durationMs) {
        setIsRunning(false);
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame((time) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time - elapsedMs;
      }

      tick(time);
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [durationMs, elapsedMs, isRunning]);

  return {
    elapsedMs,
    isRunning,
    isFinished,
    startTimer,
    resetTimer,
  };
}
