import type { Metadata } from "next";
import { TypingInputClient } from "@/features/typing-engine/components/TypingInputClient";

export const metadata: Metadata = {
  title: "Typing Test | TypeMetric",
  description: "Test your typing speed and accuracy with TypeMetric.",
};

export default function TypingTestPage() {
  return (
    <div className="w-full py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Typing Test</h1>
        <p className="text-sm text-slate-400">
          Focus, type as fast as you can, and try to make zero mistakes.
        </p>
      </div>
      <div className="rounded-3xl">
        <TypingInputClient />
      </div>
    </div>
  );
}
