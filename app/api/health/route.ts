import { NextResponse } from "next/server";

/**
 * Lightweight diagnostics for local dev / support (no secrets exposed).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    /** Same key as chat; DALL·E 3 also needs a funded OpenAI org / billing. */
    petImageUsesOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    databaseConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    elevenlabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
  });
}
