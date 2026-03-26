export type CompletionReason = "time_up" | "text_completed";

export interface SaveTypingSessionPayload {
  promptText: string;
  typedText: string;
  totalCharacters: number;
  typedCharactersCount: number;
  correctCharacters: number;
  mistakes: number;
  accuracy: number;
  wpm: number;
  elapsedMs: number;
  durationSeconds: number;
  completionReason: CompletionReason;
}

export interface SavedTypingSession {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  elapsedMs: number;
  createdAt: string;
}