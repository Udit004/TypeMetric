import { LeaderboardPageClient } from "@/features/leaderboard/components/LeaderboardPageClient";
import { getLeaderboardServer } from "@/features/leaderboard/services/leaderboardService";

export default async function LeaderboardPage() {
  let initialData = null;
  let initialError: string | null = null;

  try {
    initialData = await getLeaderboardServer("combined");
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Failed to load leaderboard";
  }

  return (
    <LeaderboardPageClient initialData={initialData} initialError={initialError} />
  );
}
