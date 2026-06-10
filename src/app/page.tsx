import type { Metadata } from "next";
import { HomePageContent } from "@/features/homePage/components/HomePageContent";

export const metadata: Metadata = {
  title: "TypeMetric — Precision Typing Speed & Analytics",
  description:
    "TypeMetric is a typing speed test with real-time WPM, accuracy tracking, mistake analysis, multiplayer racing, and leaderboards.",
  keywords: [
    "typing speed test",
    "WPM calculator",
    "typing accuracy",
    "typing analytics",
    "multiplayer typing",
    "leaderboard",
    "typing practice",
  ],
};

export default function Home() {
  return <HomePageContent />;
}
