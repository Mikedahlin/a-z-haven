const MAX_MESSAGE = 1200;

export function sanitizeChatMessage(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const t = input.trim();
  if (!t.length) return null;
  if (t.length > MAX_MESSAGE) return null;
  return t;
}

export function safePreview(text: string, n = 200): string {
  return text.slice(0, n).replace(/\s+/g, " ");
}
