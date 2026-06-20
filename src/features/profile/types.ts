export type FavoriteMode = "solo" | "multiplayer" | "hybrid";
export type ProfileVisibility = "public" | "private";

export interface ProfileIdentity {
  id: string;
  name: string;
  displayName: string;
  username: string;
  email: string;
  tagline: string;
  bio: string;
  country: string;
  timezone: string;
  profileVisibility: ProfileVisibility;
  favoriteMode: FavoriteMode;
  avatarColor: string;
  avatarImageUrl?: string;
  memberSince: string;
}

export interface PublicProfileIdentity {
  id: string;
  name: string;
  displayName: string;
  username: string;
  tagline: string;
  bio: string;
  country: string;
  timezone: string;
  favoriteMode: FavoriteMode;
  avatarColor: string;
  avatarImageUrl?: string;
  memberSince: string;
}

export interface ProfileFriend {
  friendshipId: string;
  id: string;
  name: string;
  displayName: string;
  username: string;
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

export interface GamificationSummary {
  xp: number;
  level: number;
  levelProgressPercent: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  earnedBadgeCount: number;
}

export interface ActivityGridCell {
  activityDate: string;
  heatScore: number;
  xpEarned: number;
  completedDay: boolean;
  typingSessionsCount: number;
  multiplayerRacesCount: number;
  bestWpm: number;
  bestAccuracy: number;
}

export interface PublicBadgeView {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "consistency" | "speed" | "accuracy" | "competition" | "volume";
  rarity: "common" | "rare" | "epic" | "legendary";
  sortOrder: number;
  progressCurrent: number;
  progressTarget: number;
  isCompleted: boolean;
  awardedAt: string | null;
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
  displayName: string;
  username: string;
  tagline: string;
  avatarColor: string;
  favoriteMode: FavoriteMode;
  relationshipStatus: "none" | "friends" | "incoming_request" | "outgoing_request";
  requestId: string | null;
}

export interface PrivateProfileDashboard {
  profile: ProfileIdentity;
  typingStats: ProfileStats;
  racingStats: RacingStats;
  gamification: GamificationSummary;
  activityGrid: ActivityGridCell[];
  badges: PublicBadgeView[];
  recentTypingSessions: RecentTypingSession[];
  recentRaces: RecentRace[];
  friends: ProfileFriend[];
  incomingRequests: ProfileFriend[];
  outgoingRequests: ProfileFriend[];
}

export interface PublicProfileView {
  profile: PublicProfileIdentity;
  typingStats: ProfileStats;
  racingStats: RacingStats;
  gamification: GamificationSummary;
  activityGrid: ActivityGridCell[];
  badges: PublicBadgeView[];
  recentTypingSessions: RecentTypingSession[];
  recentRaces: RecentRace[];
}
