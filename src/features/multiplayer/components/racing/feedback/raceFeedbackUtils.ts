import { isCharacterCorrect } from "@/features/typing-engine/lib/validation";

export const WORD_CELEBRATION_INTERVAL = 3;

export function getLeadingCorrectCharacters(
  typedCharacters: string[],
  parsedText: string[]
): number {
  let correctCount = 0;

  while (
    correctCount < typedCharacters.length &&
    isCharacterCorrect(typedCharacters[correctCount], parsedText[correctCount] ?? "")
  ) {
    correctCount += 1;
  }

  return correctCount;
}

export function countCompletedWords(text: string, uptoIndex: number): number {
  if (uptoIndex <= 0) {
    return 0;
  }

  let completedWords = 0;
  const wordMatcher = /\S+/g;
  let currentMatch = wordMatcher.exec(text);

  while (currentMatch) {
    const matchEnd = currentMatch.index + currentMatch[0].length;

    if (matchEnd > uptoIndex) {
      break;
    }

    const nextCharacter = text[matchEnd] ?? "";

    if (!nextCharacter || /\s|[.,!?;:]/.test(nextCharacter)) {
      completedWords += 1;
    }

    currentMatch = wordMatcher.exec(text);
  }

  return completedWords;
}

export function countCompletedSentences(text: string, uptoIndex: number): number {
  if (uptoIndex <= 0) {
    return 0;
  }

  const completedText = text.slice(0, uptoIndex);
  return completedText.match(/[.!?](?=(\s|$))/g)?.length ?? 0;
}

export function getCurrentCorrectStreak(
  typedCharacters: string[],
  parsedText: string[]
): number {
  let streak = 0;

  for (let index = typedCharacters.length - 1; index >= 0; index -= 1) {
    if (!isCharacterCorrect(typedCharacters[index], parsedText[index] ?? "")) {
      break;
    }

    streak += 1;
  }

  return streak;
}
