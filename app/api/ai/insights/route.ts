import OpenAI from "openai";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizePetProfile } from "@/lib/pet-validation";
import { getClientIp } from "@/lib/api-request";

export const runtime = "nodejs";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`insights:${ip}`, 12, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Soft limit—try again in a little while." },
      { status: 429 },
    );
  }

  if (!openai) {
    return NextResponse.json(
      { error: "AI not configured (missing OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pet = sanitizePetProfile((body as { petProfile?: unknown }).petProfile);
  if (!pet) {
    return NextResponse.json({ error: "Invalid pet profile" }, { status: 400 });
  }

  const userPrompt = `Given this virtual pet, return a single JSON object only (no markdown) with keys:
- "reactionLine": one short warm in-world reaction line (max 120 chars) as if the pet just did something cute.
- "favoriteItems": array of 3 short strings (toys, treats, or cozy objects) that fit this pet.
- "voiceNotes": one sentence describing how dialogue should sound for this pet.

Pet:
name=${pet.petName}, type=${pet.petType}, ageVibe=${pet.ageVibe}, tags=${pet.tags.join(", ")}, bio=${pet.bio ?? "none"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You output only valid minified JSON. No code fences. A–Z Haven is a cozy premium pet game.",
        },
        { role: "user", content: userPrompt },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: "Empty model output" }, { status: 502 });
    }
    const parsed = JSON.parse(raw) as {
      reactionLine?: string;
      favoriteItems?: string[];
      voiceNotes?: string;
    };
    return NextResponse.json({
      reactionLine: String(parsed.reactionLine ?? "").slice(0, 200),
      favoriteItems: Array.isArray(parsed.favoriteItems)
        ? parsed.favoriteItems.map((s) => String(s)).slice(0, 5)
        : [],
      voiceNotes: String(parsed.voiceNotes ?? "").slice(0, 300),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not generate insights right now." },
      { status: 502 },
    );
  }
}
