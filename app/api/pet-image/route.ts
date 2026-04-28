import OpenAI, { APIError } from "openai";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api-request";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY?.trim();
const openai = apiKey ? new OpenAI({ apiKey }) : null;

function sanitizeNamePart(s: string, max: number): string {
  return s
    .slice(0, max)
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPrompt(
  petName: string,
  petType: string,
  tags: string[],
): string {
  const name = sanitizeNamePart(petName, 40) || "friend";
  const type = sanitizeNamePart(petType, 40) || "pet";
  const tagStr = tags
    .slice(0, 5)
    .map((t) => sanitizeNamePart(t, 28))
    .filter(Boolean)
    .join(", ");
  return [
    "Children's book illustration, single full-body or portrait of one animal.",
    `A gentle ${type} with a warm, friendly expression.`,
    `The pet's name is ${name} (do not draw text, letters, or captions).`,
    tagStr ? `Mood: ${tagStr}.` : "",
    "Soft cozy pastel palette, simple blurred background, no text, no watermark, family-friendly.",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: "Image generation is not configured (missing OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`pet-image:${ip}`, 6, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many image requests. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const petName = String(o.petName ?? "").trim();
  const petType = String(o.petType ?? "").trim();
  const tags = Array.isArray(o.tags)
    ? o.tags.map((t) => String(t)).filter(Boolean).slice(0, 12)
    : [];

  if (petName.length < 1 || petName.length > 48) {
    return NextResponse.json(
      { error: "petName must be 1–48 characters." },
      { status: 400 },
    );
  }
  if (petType.length < 1 || petType.length > 48) {
    return NextResponse.json(
      { error: "petType must be 1–48 characters." },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(petName, petType, tags);
  if (prompt.length > 3500) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }

  try {
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "standard",
      style: "natural",
    });

    const b64 = res.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image returned. Try a shorter description." },
        { status: 502 },
      );
    }

    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({
      dataUrl,
      revisedPrompt: res.data?.[0]?.revised_prompt,
    });
  } catch (e: unknown) {
    const detail =
      e instanceof APIError
        ? e.message
        : e && typeof e === "object" && "message" in e
          ? String((e as Error).message)
          : "Unknown error";
    console.error("pet-image:", detail);
    const status =
      e instanceof APIError && typeof e.status === "number" && e.status > 0
        ? e.status
        : 502;
    return NextResponse.json(
      {
        error: "Image generation failed (see detail).",
        detail,
      },
      { status },
    );
  }
}
