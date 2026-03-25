export type CharacterStatus = "idle" | "correct" | "incorrect" | "active";

export interface TypingState {
  currentIndex: number;
  mistakes: number;
  typedCharacters: string[];
}
