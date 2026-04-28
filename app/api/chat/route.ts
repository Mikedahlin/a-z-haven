import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/chat-prompt";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { sanitizeChatMessage, safePreview } from "@/lib/validation";
import type { PetProfileSnapshot } from "@/lib/types";
import { getClientIp } from "@/lib/api-request";

export const runtime = "nodejs";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

type ChatRole = "user" | "assistant" | "system";

type IncomingMsg = { role: ChatRole; content: string };

function parsePet(raw: unknown): PetProfileSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const petName = String(o.petName ?? o.name ?? "").trim();
  if (!petName.length) return null;
  const petType = String(o.petType ?? o.species ?? "friend");
  const tags = Array.isArray(o.tags)
    ? o.tags.map((t) => String(t)).slice(0, 12)
    : [];
  return {
    id: typeof o.id === "string" ? o.id : undefined,
    petName,
    petType,
    bio: typeof o.bio === "string" ? o.bio : null,
    personality: typeof o.personality === "string" ? o.personality : "{}",
    ageVibe: o.ageVibe === "older" ? "older" : "younger",
    tags,
    imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : null,
    onboardingComplete: Boolean(o.onboardingComplete),
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`chat:${ip}`, 24, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Too many messages—please take a cozy break and try again soon.",
        retryAfterMs: limited.retryAfterMs,
      },
      { status: 429 },
    );
  }

  if (!openai) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured yet. Add OPENAI_API_KEY to your environment on the server.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const mode = (body as { mode?: string }).mode;
  const messages = (body as { messages?: IncomingMsg[] }).messages;
  const pet = parsePet((body as { petProfile?: unknown }).petProfile);

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages[] required." }, { status: 400 });
  }
  if (messages.length > 24) {
    return NextResponse.json({ error: "Too many messages." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last?.role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from the user." },
      { status: 400 },
    );
  }

  const cleaned: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const c = sanitizeChatMessage(m.content);
    if (!c) continue;
    cleaned.push({ role: m.role, content: c });
  }
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "No valid user message." },
      { status: 400 },
    );
  }

  const chatMode = mode === "pet" ? "pet" : "narrator";
  const systemPrompt = buildChatSystemPrompt(pet, chatMode);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        ...cleaned.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "No response from model." },
        { status: 502 },
      );
    }

    if (process.env.CHAT_AUDIT_LOG === "1") {
      await prisma.chatAudit.create({
        data: {
          role: "assistant",
          preview: safePreview(text),
        },
      });
    }

    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error:
          "The cozy line is a little tangled—try again in a moment.",
      },
      { status: 502 },
    );
  }
}
