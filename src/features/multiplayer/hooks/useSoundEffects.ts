import { useCallback, useEffect, useRef } from "react";

interface AudioCache {
  countdown?: HTMLAudioElement;
  race?: HTMLAudioElement;
  cheer?: HTMLAudioElement;
  victory?: HTMLAudioElement;
}

interface UseSoundEffectsOptions {
  enabled?: boolean;
  volume?: number;
}

/**
 * Sound effect hook that plays only static files from /public/sounds.
 */
export function useSoundEffects(options: UseSoundEffectsOptions = {}) {
  const { enabled = true, volume = 0.3 } = options;

  const cacheRef = useRef<AudioCache>({});
  const isInitializedRef = useRef(false);
  const lastPlayTimeRef = useRef<Record<string, number>>({});

  const loadAudio = useCallback(
    (key: keyof AudioCache, src: string): HTMLAudioElement | null => {
      if (!enabled) {
        return null;
      }

      const cached = cacheRef.current[key];
      if (cached) {
        return cached;
      }

      try {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.preload = "none";
        cacheRef.current[key] = audio;
        return audio;
      } catch {
        console.warn(`Failed to load audio file: ${src}`);
        return null;
      }
    },
    [enabled, volume]
  );

  const playSound = useCallback(
    async (key: keyof AudioCache, src: string, debounceMs: number = 0): Promise<void> => {
      if (!enabled) {
        return;
      }

      const now = Date.now();
      const lastPlayTime = lastPlayTimeRef.current[key] ?? 0;

      if (now - lastPlayTime < debounceMs) {
        return;
      }

      lastPlayTimeRef.current[key] = now;

      const audio = loadAudio(key, src);
      if (!audio) {
        return;
      }

      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.debug("Audio playback blocked or failed", error);
      }
    },
    [enabled, loadAudio]
  );

  const playCountdownTick = useCallback(() => {
    void playSound("countdown", "/sounds/countdown-tick.mp3", 200);
  }, [playSound]);

  const playRaceStart = useCallback(() => {
    void playSound("race", "/sounds/race-start.mp3");
  }, [playSound]);

  const playCheering = useCallback(() => {
    void playSound("cheer", "/sounds/cheering.mp3", 500);
  }, [playSound]);

  const playVictory = useCallback(() => {
    void playSound("victory", "/sounds/victory.mp3");
  }, [playSound]);

  const stopCountdownTick = useCallback(() => {
    const audio = cacheRef.current.countdown;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    Object.values(cacheRef.current).forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      Object.values(cache).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const enableSoundOnInteraction = useCallback(() => {
    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    const silentTest = new Audio(
      "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    );

    silentTest.play().catch(() => {
      console.debug("Audio playback requires user interaction");
    });
  }, []);

  return {
    playCountdownTick,
    playRaceStart,
    playCheering,
    playVictory,
    stopCountdownTick,
    enableSoundOnInteraction,
  };
}
