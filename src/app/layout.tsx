import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/share/components/app-shell";
import { AuthProvider } from "@/share/contexts/authContext";
import { PHProvider } from "./providers";
import GoogleAnalytics from "@/share/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TypeMetric — Advanced Typing Speed Test & Analytics Platform",
  
  description:
    "TypeMetric is a high-performance typing speed test platform that provides real-time WPM calculation, accuracy tracking, mistake analysis, and detailed typing analytics. Built with modern web technologies for precise performance measurement and skill improvement.",

  keywords: [
    "typing speed test",
    "WPM calculator",
    "typing accuracy test",
    "typing analytics",
    "typing practice",
    "typing performance tool",
    "keyboard typing test",
    "typing improvement",
    "typing benchmark",
    "typing metrics",
    "developer typing test",
    "real time typing analysis",
    "learn to type",
    "typing lessons",
    "touch typing",
    "typing tutor",
    "typing trainer",
    "online typing course",
    "typing exercises",
    "typing drills",
    "improve typing speed",
    "increase wpm",
    "typing practice online",
    "typing test with analytics",
    "typing leaderboard",
    "multiplayer typing",
    "competitive typing",
    "typing challenge",
    "typing coach",
    "free typing test",
    "online typing game",
    "typing accuracy metrics",
    "keyboard skills",
    "typing for programmers",
    "typing for developers",
    "typing assessment",
    "typing statistics",
    "typing performance metrics",
    "how to improve typing speed",
    "learn touch typing online",
    "typing practice for kids",
    "typing lessons for adults",
    "typing speed course",
    "type learning website",
    "type master",
    "typing mastery",
    "typing productivity",
    "wpm test",
    "typing accuracy test online",
    "professional typing test",
    "typing benchmark test",
    "keyboarding practice",
    "typing improvement tips",
    "practice typing",
    "typing skills improvement",
    "typing speed tracker",
    "typing session analytics",
    "typing result analysis",
    "typing performance dashboard",
    "online typing platform"
  ],

  authors: [{ name: "TypeMetric Team" }],

  creator: "TypeMetric",

  metadataBase: new URL("https://typemetric.vercel.app"),

  openGraph: {
    title: "TypeMetric — Precision Typing Analytics Platform",
    description:
      "Measure typing speed, accuracy, and performance using real-time analytics. TypeMetric provides professional-grade typing insights.",
    url: "https://typemetric.vercel.app",
    siteName: "TypeMetric",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TypeMetric — Typing Speed & Accuracy Analytics",
    description:
      "Real-time WPM tracking, accuracy insights, and performance-focused typing tests.",
  },

  robots: {
    index: true,
    follow: true,
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <PHProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </PHProvider>
      </body>
    </html>
  );
}
