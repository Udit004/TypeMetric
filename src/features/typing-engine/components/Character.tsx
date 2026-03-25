import { memo } from "react";
import type { CharacterStatus } from "../types/typingTypes";

interface CharacterProps {
  char: string;
  status: CharacterStatus;
}

const statusClasses: Record<CharacterStatus, string> = {
  idle: "text-slate-500",
  active: "text-cyan-200",
  correct: "text-emerald-200",
  incorrect: "rounded-sm bg-rose-400/25 text-rose-100",
};

function CharacterComponent({ char, status }: CharacterProps) {
  return (
    <span data-status={status} className={statusClasses[status]}>
      {char}
    </span>
  );
}

export const Character = memo(CharacterComponent);
