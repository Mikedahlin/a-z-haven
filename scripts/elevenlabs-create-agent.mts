/**
 * Create an ElevenLabs Conversational AI agent (dashboard API).
 *
 *   npx tsx scripts/elevenlabs-create-agent.mts
 *
 * Needs `ELEVENLABS_API_KEY` in repo-root `.env`. Optional:
 *   ELEVENLABS_CONVAI_AGENT_NAME
 *   ELEVENLABS_CONVAI_SYSTEM_PROMPT
 */
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) {
  console.error("Set ELEVENLABS_API_KEY in .env (repo root).");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({ apiKey: key });

const name =
  process.env.ELEVENLABS_CONVAI_AGENT_NAME?.trim() ?? "A–Z Haven companion";
const promptText =
  process.env.ELEVENLABS_CONVAI_SYSTEM_PROMPT?.trim() ??
  "You are a warm, cozy in-game companion for A–Z Haven. Be brief, kind, and never rush the player.";

async function main() {
  try {
    const agent = await elevenlabs.conversationalAi.agents.create({
      name,
      conversationConfig: {
        agent: {
          prompt: {
            prompt: promptText,
          },
        },
      },
    });

    console.log("Agent created. Save the agent id for widgets / webhooks if needed.\n");
    console.log(JSON.stringify(agent, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

void main();
