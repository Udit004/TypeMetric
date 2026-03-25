import { useCallback, useMemo, useState } from "react";
import { parseTextToCharacters } from "../lib/textParser";
import { isCharacterCorrect } from "../lib/validation";
import type { TypingState } from "../types/typingTypes";

interface UseTypingEngineOptions {
  onFirstInput?: () => void;
}

interface UseTypingEngineReturn extends TypingState {
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  resetTyping: () => void;
}

function isPrintableKey(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function useTypingEngine(
  text: string,
  options: UseTypingEngineOptions = {}
): UseTypingEngineReturn {
  const { onFirstInput } = options;
  const targetCharacters = useMemo(() => parseTextToCharacters(text), [text]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedCharacters, setTypedCharacters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);

  const recalculateMistakes = useCallback(
    (nextTyped: string[]) => {
      let errorCount = 0;

      for (let index = 0; index < nextTyped.length; index += 1) {
        if (!isCharacterCorrect(nextTyped[index], targetCharacters[index] ?? "")) {
          errorCount += 1;
        }
      }

      return errorCount;
    },
    [targetCharacters]
  );

  const handleBackspace = useCallback(() => {
    setTypedCharacters((previousTyped) => {
      if (previousTyped.length === 0) {
        return previousTyped;
      }

      const nextTyped = previousTyped.slice(0, -1);
      setCurrentIndex(nextTyped.length);
      setMistakes(recalculateMistakes(nextTyped));
      return nextTyped;
    });
  }, [recalculateMistakes]);

  const handleTypedCharacter = useCallback(
    (typedChar: string) => {
      setTypedCharacters((previousTyped) => {
        if (previousTyped.length >= targetCharacters.length) {
          return previousTyped;
        }

        if (previousTyped.length === 0) {
          onFirstInput?.();
        }

        const nextTyped = [...previousTyped, typedChar];
        setCurrentIndex(nextTyped.length);
        setMistakes(recalculateMistakes(nextTyped));

        // TODO: Add support for custom word-boundary and punctuation rules.
        return nextTyped;
      });
    },
    [onFirstInput, recalculateMistakes, targetCharacters.length]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        handleBackspace();
        return;
      }

      if (!isPrintableKey(event)) {
        return;
      }

      event.preventDefault();
      handleTypedCharacter(event.key);
    },
    [handleBackspace, handleTypedCharacter]
  );

  const resetTyping = useCallback(() => {
    setCurrentIndex(0);
    setTypedCharacters([]);
    setMistakes(0);
  }, []);

  return {
    currentIndex,
    mistakes,
    typedCharacters,
    handleKeyDown,
    resetTyping,
  };
}
