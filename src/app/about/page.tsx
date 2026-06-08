import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — TypeMetric",
  description:
    "About TypeMetric — what we do, how we measure typing performance, and how to get started improving your typing speed and accuracy.",
};

export default function AboutPage() {
  return (
    <main className="prose mx-auto py-12 px-6">
      <h1>About TypeMetric</h1>

      <p>
        TypeMetric is a precision-focused typing platform built to help people
        measure, understand, and improve their typing performance. We provide
        fast, accurate WPM calculation, detailed accuracy tracking, mistake
        analysis, session history, and comprehensive analytics so learners and
        professionals can monitor progress over time.
      </p>

      <h2>Who it&apos;s for</h2>
      <p>
        TypeMetric is designed for learners of all levels — from beginners who
        want to learn touch typing to seasoned developers and professionals who
        want to benchmark and improve productivity. We support solo practice,
        multiplayer challenges, and leaderboard-based competition.
      </p>

      <h2>Core features</h2>
      <ul>
        <li>Real-time WPM and accuracy calculation with low-latency updates.</li>
        <li>Per-character mistake analysis and heatmaps of common errors.</li>
        <li>Session history and progress charts to see improvement over time.</li>
        <li>Multiplayer rooms and competitive leaderboards.</li>
        <li>Curated practice drills and lessons to target weak areas.</li>
        <li>Exportable results and shareable links for challenges.</li>
      </ul>

      <h2>How it works</h2>
      <p>
        TypeMetric captures every keystroke during a typing session, timestamping
        input to calculate words-per-minute (WPM) and accuracy with high
        precision. Results are aggregated into session reports and visualized
        with charts so users can spot trends and focus practice where it helps
        most.
      </p>

      <h2>Privacy & data</h2>
      <p>
        We take privacy seriously. Session data (results, timestamps, and
        analytics) is stored to provide history and leaderboards. We do not
        sell personal data. If you have questions about data retention or
        removal, contact us through the site.
      </p>

      <h2>Get started</h2>
      <p>
        Start a typing test from the home page, try the practice drills, or
        create a multiplayer room to challenge friends. Use the analytics page
        to review past sessions and focus practice on areas where your
        accuracy drops.
      </p>

      <h2>Contact & feedback</h2>
      <p>
        We&apos;re constantly improving TypeMetric — if you have feature requests,
        bug reports, or partnership inquiries, please reach out via the
        contact form in the footer or open an issue on our project repository.
      </p>

      <h2>Mission</h2>
      <p>
        Our mission is to give learners simple, actionable insights to become
        faster and more accurate typists. We combine precise measurement with
        accessible practice tools and social motivation to help users reach
        their goals.
      </p>
    </main>
  );
}
