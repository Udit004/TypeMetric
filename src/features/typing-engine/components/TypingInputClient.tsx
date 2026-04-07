"use client";

import dynamic from "next/dynamic";

const TypingInput = dynamic(
  () =>
    import("@/features/typing-engine/components/TypingInput").then(
      (module) => module.TypingInput
    ),
  { ssr: false }
);

export function TypingInputClient() {
  return <TypingInput />;
}
