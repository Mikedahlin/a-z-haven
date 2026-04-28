/**
 * Play ElevenLabs TTS from our server route (browser — uses blob URL, not the Node `play()` helper).
 */
export async function playElevenTts(
  text: string,
  options?: { voiceId?: string },
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: trimmed,
      ...(options?.voiceId ? { voiceId: options.voiceId } : {}),
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Speech request failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio(url);
    await audio.play();
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
