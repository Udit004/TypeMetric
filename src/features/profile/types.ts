export type FavoriteMode = "solo" | "multiplayer" | "hybrid";

export interface ProfileIdentity {
  id: string;
  name: string;
  email: string;
  tagline: string;
  bio: string;
  country: string;
  favoriteMode: FavoriteMode;
  avatarColor: string;
  memberSince: string;
}

export interface ProfileFriend {
  friendshipId: string;
  id: string;
  name: string;
  email: string;
  tagline: string;
  avatarColor: string;
  favoriteMode: FavoriteMode;
  createdAt: string;
}

export interface ProfileStats {
  sessionsCount: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalMistakes: number;
}

export interface RacingStats extends ProfileStats {
  winsCount: number;
  podiumCount: number;
}

export interface RecentTypingSession {
  id: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  elapsedMs: number;
  durationSeconds: number;
  completionReason: "time_up" | "text_completed";
  createdAt: string;
}

export interface RecentRace {
  id: string;
  roomId: string;
  raceNumber: number;
  rank: number;
  score: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  typedCharacters: number;
  createdAt: string;
}

export interface SearchUserResult {
  id: string;
  name: string;
  email: string;
  tagline: string;
  avatarColor: string;
  favoriteMode: FavoriteMode;
  relationshipStatus: "none" | "friends" | "incoming_request" | "outgoing_request";
  requestId: string | null;
}

export interface ProfileDashboard {
  profile: ProfileIdentity;
  typingStats: ProfileStats;
  racingStats: RacingStats;
  recentTypingSessions: RecentTypingSession[];
  recentRaces: RecentRace[];
  friends: ProfileFriend[];
  incomingRequests: ProfileFriend[];
  outgoingRequests: ProfileFriend[];
}
