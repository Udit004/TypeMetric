export { Character } from "./components/Character";
export { Cursor } from "./components/Cursor";
export { TextRenderer } from "./components/TextRenderer";
export { TypingInput } from "./components/TypingInput";
export { TypingStats } from "./components/TypingStats";

export { useTimer } from "./hooks/useTimer";
export { useTypingEngine } from "./hooks/useTypingEngine";

export { calculateAccuracy, calculateWPM } from "./lib/metrics";
export { parseTextToCharacters } from "./lib/textParser";
export { isCharacterCorrect } from "./lib/validation";

export { DEFAULT_TEXT, TEST_DURATION } from "./constants/typingConfig";
export type { CharacterStatus, TypingState } from "./types/typingTypes";
