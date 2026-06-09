"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoomStatus } from "../../../types/multiplayerTypes";
import { MomentBanner, ReactionBurst } from "./raceFeedbackTypes";
import { WORD_CELEBRATION_INTERVAL } from "./raceFeedbackUtils";

const FINISH_TRANSITION_MS = 1800;

interface UseRaceFeedbackOptions {
  completedSentences: number;
  completedWords: number;
  onRaceStart: () => void;
  roomStatus: RoomStatus | undefined;
}

interface UseRaceFeedbackReturn {
  isFinishTransitionActive: boolean;
  momentBanner: MomentBanner | null;
  reactionBursts: ReactionBurst[];
}

export function useRaceFeedback({
  completedSentences,
  completedWords,
  onRaceStart,
  roomStatus,
}: UseRaceFeedbackOptions): UseRaceFeedbackReturn {
  const [reactionBursts, setReactionBursts] = useState<ReactionBurst[]>([]);
  const [momentBanner, setMomentBanner] = useState<MomentBanner | null>(null);
  const [isFinishTransitionActive, setIsFinishTransitionActive] = useState(false);

  const celebrationTimeoutsRef = useRef<number[]>([]);
  const nextReactionIdRef = useRef(1);
  const completedWordMilestoneRef = useRef(0);
  const completedSentenceCountRef = useRef(0);
  const previousStatusRef = useRef<RoomStatus | null>(null);

  const clearCelebrationTimeouts = useCallback(() => {
    celebrationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    celebrationTimeoutsRef.current = [];
  }, []);

  const scheduleCelebration = useCallback((callback: () => void, delayMs = 0) => {
    const timeoutId = window.setTimeout(callback, delayMs);
    celebrationTimeoutsRef.current.push(timeoutId);
  }, []);

  const showMomentBanner = useCallback((banner: MomentBanner, durationMs = 1500) => {
    setMomentBanner(banner);

    const timeoutId = window.setTimeout(() => {
      setMomentBanner((currentBanner) => (currentBanner === banner ? null : currentBanner));
    }, durationMs);

    celebrationTimeoutsRef.current.push(timeoutId);
  }, []);

  const spawnReaction = useCallback((
    config: Pick<ReactionBurst, "emoji" | "message" | "accentClassName"> & {
      count?: number;
      durationMs?: number;
      baseSize?: number;
    }
  ) => {
    const count = config.count ?? 1;
    const durationMs = config.durationMs ?? 1800;
    const baseSize = config.baseSize ?? 46;

    const nextBursts = Array.from({ length: count }, (_, index) => ({
      id: nextReactionIdRef.current + index,
      emoji: config.emoji,
      message: config.message,
      x: 18 + Math.random() * 64,
      y: 20 + Math.random() * 48,
      size: baseSize + Math.random() * 22,
      durationMs: durationMs + Math.round(Math.random() * 350),
      accentClassName: config.accentClassName,
    }));

    nextReactionIdRef.current += count;
    setReactionBursts((previousBursts) => [...previousBursts, ...nextBursts]);

    nextBursts.forEach((burst) => {
      const timeoutId = window.setTimeout(() => {
        setReactionBursts((previousBursts) =>
          previousBursts.filter((previousBurst) => previousBurst.id !== burst.id)
        );
      }, burst.durationMs);

      celebrationTimeoutsRef.current.push(timeoutId);
    });
  }, []);

  useEffect(() => {
    return () => {
      clearCelebrationTimeouts();
    };
  }, [clearCelebrationTimeouts]);

  useEffect(() => {
    const currentStatus = roomStatus ?? null;

    if (previousStatusRef.current !== "racing" && currentStatus === "racing") {
      onRaceStart();
      completedWordMilestoneRef.current = 0;
      completedSentenceCountRef.current = 0;
      scheduleCelebration(() => {
        setIsFinishTransitionActive(false);
      });
      scheduleCelebration(() => {
        setReactionBursts([]);
        showMomentBanner(
          {
            title: "Go!",
            subtitle: "Race is live. Build rhythm and keep pressure on.",
            accentClassName: "race-moment-banner--start",
          },
          1800
        );
        spawnReaction({
          emoji: "🚀",
          message: "Boost",
          accentClassName: "race-reaction-burst--start",
          count: 4,
          durationMs: 1900,
          baseSize: 54,
        });
      });
    }

    if (previousStatusRef.current !== "finished" && currentStatus === "finished") {
      completedWordMilestoneRef.current = 0;
      completedSentenceCountRef.current = 0;
      scheduleCelebration(() => {
        setIsFinishTransitionActive(true);
      });
      scheduleCelebration(() => {
        showMomentBanner(
          {
            title: "Finish!",
            subtitle: "Race complete. Final standings locked in.",
            accentClassName: "race-moment-banner--finish",
          },
          2200
        );
        spawnReaction({
          emoji: "🏁",
          message: "Finish",
          accentClassName: "race-reaction-burst--finish",
          count: 5,
          durationMs: 2200,
          baseSize: 58,
        });
      });
      scheduleCelebration(() => {
        setIsFinishTransitionActive(false);
      }, FINISH_TRANSITION_MS);
    }

    if (currentStatus !== "racing" && currentStatus !== "finished") {
      completedWordMilestoneRef.current = 0;
      completedSentenceCountRef.current = 0;
      scheduleCelebration(() => {
        setIsFinishTransitionActive(false);
      });
    }

    previousStatusRef.current = currentStatus;
  }, [onRaceStart, roomStatus, scheduleCelebration, showMomentBanner, spawnReaction]);

  useEffect(() => {
    if (roomStatus !== "racing") {
      return;
    }

    const reachedMilestone = Math.floor(completedWords / WORD_CELEBRATION_INTERVAL);

    if (reachedMilestone <= completedWordMilestoneRef.current) {
      return;
    }

    completedWordMilestoneRef.current = reachedMilestone;
    scheduleCelebration(() => {
      showMomentBanner(
        {
          title: "Well done",
          subtitle: `${completedWords} words clean. Keep the flow going.`,
          accentClassName: "race-moment-banner--clap",
        },
        1350
      );
      spawnReaction({
        emoji: "👏",
        message: "Well done",
        accentClassName: "race-reaction-burst--clap",
        count: 4,
        durationMs: 1700,
        baseSize: 48,
      });
    });
  }, [completedWords, roomStatus, scheduleCelebration, showMomentBanner, spawnReaction]);

  useEffect(() => {
    if (roomStatus !== "racing") {
      return;
    }

    if (completedSentences <= completedSentenceCountRef.current) {
      return;
    }

    completedSentenceCountRef.current = completedSentences;
    scheduleCelebration(() => {
      showMomentBanner(
        {
          title: "Sentence cleared",
          subtitle: "You nailed a full line. Turn up the heat.",
          accentClassName: "race-moment-banner--fire",
        },
        1650
      );
      spawnReaction({
        emoji: "🔥",
        message: "On fire",
        accentClassName: "race-reaction-burst--fire",
        count: 6,
        durationMs: 2100,
        baseSize: 52,
      });
    });
  }, [completedSentences, roomStatus, scheduleCelebration, showMomentBanner, spawnReaction]);

  return {
    isFinishTransitionActive,
    momentBanner,
    reactionBursts,
  };
}
