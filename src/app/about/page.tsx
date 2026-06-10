import type { Metadata } from "next";

import { AboutPageContent } from "@/features/aboutPage/components/AboutPageContent";

export const metadata: Metadata = {
  title: "About — TypeMetric",
  description:
    "Learn how TypeMetric measures typing speed and accuracy with real-time analytics, multiplayer racing, and leaderboards.",
  keywords: [
    "about TypeMetric",
    "typing speed test",
    "typing analytics",
    "multiplayer typing",
    "leaderboard",
  ],
};

export default function AboutPage() {
  return <AboutPageContent />;
}
