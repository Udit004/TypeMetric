import { useEffect, useMemo, useRef, useState } from "react";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import type { CharacterStatus } from "../types/typingTypes";
import { Character } from "./Character";
import { Cursor } from "./Cursor";

interface TextRendererProps {
  text: string;
  typedCharacters: string[];
  currentIndex: number;
  isFinished?: boolean;
  onRestart?: () => void;
}

const LINES_PER_PAGE = 3;
const MIN_ESTIMATED_CHARACTERS_PER_LINE = 24;
const MAX_ESTIMATED_CHARACTERS_PER_LINE = 76;
const FORWARD_LOOKAHEAD_CHARACTERS = 10;

interface LineRange {
  start: number;
  end: number;
}

function buildLineRanges(
  characters: string[],
  estimatedCharactersPerLine: number,
  maxCharactersPerLine: number
): LineRange[] {
  const ranges: LineRange[] = [];
  let lineStart = 0;

  while (lineStart < characters.length) {
    const hardEnd = Math.min(lineStart + estimatedCharactersPerLine, characters.length);

    if (hardEnd >= characters.length) {
      ranges.push({ start: lineStart, end: hardEnd });
      break;
    }

    let previousBoundary = -1;
    for (let index = hardEnd - 1; index >= lineStart; index -= 1) {
      if (characters[index] === " ") {
        previousBoundary = index + 1;
        break;
      }
    }

    let nextBoundary = -1;
    const forwardLimit = Math.min(lineStart + maxCharactersPerLine, characters.length - 1);
    for (let index = hardEnd; index <= forwardLimit; index += 1) {
      if (characters[index] === " ") {
        nextBoundary = index + 1;
        break;
      }
    }

    let lineEnd = hardEnd;
    if (previousBoundary > lineStart && nextBoundary > lineStart) {
      const target = lineStart + estimatedCharactersPerLine;
      const previousDistance = Math.abs(target - previousBoundary);
      const nextDistance = Math.abs(nextBoundary - target);
      lineEnd = nextDistance < previousDistance ? nextBoundary : previousBoundary;
    } else if (previousBoundary > lineStart) {
      lineEnd = previousBoundary;
    } else if (nextBoundary > lineStart) {
      lineEnd = nextBoundary;
    }

    ranges.push({ start: lineStart, end: lineEnd });
    lineStart = lineEnd;
  }

  return ranges;
}

function getLineIndexForCursor(lineRanges: LineRange[], currentIndex: number): number {
  if (lineRanges.length === 0) {
    return 0;
  }

  for (let index = 0; index < lineRanges.length; index += 1) {
    if (currentIndex < lineRanges[index].end) {
      return index;
    }
  }

  return lineRanges.length - 1;
}

function getCharacterStatus(
  index: number,
  expectedChar: string,
  typedCharacters: string[],
  currentIndex: number
): CharacterStatus {
  const typedChar = typedCharacters[index];

  if (typedChar === undefined) {
    return index === currentIndex ? "active" : "idle";
  }

  return isCharacterCorrect(typedChar, expectedChar) ? "correct" : "incorrect";
}

export function TextRenderer({
  text,
  typedCharacters,
  currentIndex,
  isFinished = false,
  onRestart,
}: TextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [estimatedCharactersPerLine, setEstimatedCharactersPerLine] = useState(
    MAX_ESTIMATED_CHARACTERS_PER_LINE
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateEstimate = () => {
      const computedStyle = window.getComputedStyle(container);
      const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
      const contentWidth = Math.max(container.clientWidth - paddingLeft - paddingRight, 0);

      if (contentWidth <= 0) {
        return;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.font = computedStyle.font;
      const sample = "0".repeat(40);
      const averageCharacterWidth = context.measureText(sample).width / sample.length;

      if (averageCharacterWidth <= 0) {
        return;
      }

      const nextEstimate = Math.floor(contentWidth / averageCharacterWidth);
      const clampedEstimate = Math.min(
        MAX_ESTIMATED_CHARACTERS_PER_LINE,
        Math.max(MIN_ESTIMATED_CHARACTERS_PER_LINE, nextEstimate)
      );

      setEstimatedCharactersPerLine((previous) =>
        previous === clampedEstimate ? previous : clampedEstimate
      );
    };

    updateEstimate();

    const resizeObserver = new ResizeObserver(() => {
      updateEstimate();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const parsedText = useMemo(() => parseTextToCharacters(text), [text]);
  const { visibleLineRanges, visibleStart, visibleEnd } = useMemo(() => {
    const maxCharactersPerLine = estimatedCharactersPerLine + FORWARD_LOOKAHEAD_CHARACTERS;
    const lineRanges = buildLineRanges(
      parsedText,
      estimatedCharactersPerLine,
      maxCharactersPerLine
    );
    const cursorLineIndex = getLineIndexForCursor(lineRanges, currentIndex);
    const pageIndex = Math.floor(cursorLineIndex / LINES_PER_PAGE);
    const startLine = pageIndex * LINES_PER_PAGE;
    const currentVisibleLineRanges = lineRanges.slice(startLine, startLine + LINES_PER_PAGE);
    const start = currentVisibleLineRanges[0]?.start ?? 0;
    const end = currentVisibleLineRanges[currentVisibleLineRanges.length - 1]?.end ?? 0;

    return {
      visibleLineRanges: currentVisibleLineRanges,
      visibleStart: start,
      visibleEnd: end,
    };
  }, [currentIndex, estimatedCharactersPerLine, parsedText]);

  return (
    <div
      ref={containerRef}
      aria-label="Typing text"
      className="relative rounded-2xl  bg-slate-900/75 p-5 font-mono text-lg leading-8 shadow-xl shadow-slate-950/45 sm:text-xl"
    >
      {visibleLineRanges.map((lineRange, lineIndex) => (
        <div
          key={`${lineRange.start}-${lineRange.end}`}
          className={lineIndex < visibleLineRanges.length - 1 ? "min-h-8 whitespace-pre overflow-hidden" : "whitespace-pre overflow-hidden"}
        >
          {parsedText.slice(lineRange.start, lineRange.end).map((char, localIndex) => {
            const index = lineRange.start + localIndex;
            const status = getCharacterStatus(index, char, typedCharacters, currentIndex);

            return (
              <span key={`${index}-${char}`}>
                {index === currentIndex ? <Cursor /> : null}
                <Character char={char} status={status} />
              </span>
            );
          })}
        </div>
      ))}
      {currentIndex >= parsedText.length && currentIndex >= visibleStart && currentIndex <= visibleEnd ? (
        <Cursor />
      ) : null}

      {isFinished && onRestart ? (
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-lg border border-cyan-300/45 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-500/20 cursor-pointer"
          >
            Restart Test
          </button>
        </div>
      ) : null}
    </div>
  );
}
