export function resolveWsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL;

  if (explicit && explicit.trim().length > 0) {
    return explicit.replace(/\/$/, "");
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

  const normalized = apiBase.replace(/\/api\/v1\/?$/, "");

  if (normalized.startsWith("https://")) {
    return normalized.replace("https://", "wss://");
  }

  if (normalized.startsWith("http://")) {
    return normalized.replace("http://", "ws://");
  }

  return "ws://localhost:5000";
}

export function buildWsUrl(token: string | null): string | null {
  if (!token) {
    return null;
  }

  return `${resolveWsBaseUrl()}/ws?token=${encodeURIComponent(token)}`;
}
