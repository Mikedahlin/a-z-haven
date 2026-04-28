import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/api-request";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_CHARS = 2_000;
const REQUEST_TIMEOUT_MS = 15_000;

const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // "George" — swap via ELEVENLABS_VOICE_ID

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`tts:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many speech requests. Try again in a bit." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Text-to-speech is not configured. Add ELEVENLABS_API_KEY to the server environment.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = String((body as { text?: string }).text ?? "").trim();
  if (!text.length) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Text must be at most ${MAX_CHARS} characters.` },
      { status: 400 },
    );
  }

  const voiceId =
    String((body as { voiceId?: string }).voiceId ?? "").trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim() ||
    DEFAULT_VOICE;

  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() ?? "eleven_multilingual_v2";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "content-type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          output_format: "mp3_44100_128",
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok || !response.body) {
      const details = await response.text().catch(() => "");
      console.error("ElevenLabs TTS request failed", {
        status: response.status,
        details,
      });
      return NextResponse.json(
        { error: "Could not generate speech. Check voice and model IDs." },
        { status: 502 },
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not generate speech. Check voice and model IDs." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
