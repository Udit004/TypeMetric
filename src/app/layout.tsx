import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/share/contexts/authContext";
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
    "real time typing analysis"
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
