import { useMemo } from "react";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import type { CharacterStatus } from "../types/typingTypes";
import { Character } from "./Character";
import { Cursor } from "./Cursor";

interface TextRendererProps {
  text: string;
  typedCharacters: string[];
  currentIndex: number;
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
}: TextRendererProps) {
  const parsedText = useMemo(() => parseTextToCharacters(text), [text]);

  return (
    <p
      aria-label="Typing text"
      className="rounded-2xl border border-sky-200/20 bg-slate-900/75 p-5 font-mono text-lg leading-8 shadow-xl shadow-slate-950/45 sm:text-xl"
    >
      {parsedText.map((char, index) => {
        const status = getCharacterStatus(index, char, typedCharacters, currentIndex);

        return (
          <span key={`${index}-${char}`} className="whitespace-pre-wrap">
            {index === currentIndex ? <Cursor /> : null}
            <Character char={char} status={status} />
          </span>
        );
      })}
      {currentIndex >= parsedText.length ? <Cursor /> : null}
    </p>
  );
}
