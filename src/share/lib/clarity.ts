import clarity from "@microsoft/clarity";

export function initializeClarity() {
  if (typeof window === "undefined") return;

  clarity.init(
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID!
  );
}