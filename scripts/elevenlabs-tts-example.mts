/**
 * ElevenLabs quickstart (TypeScript) — same flow as the official docs.
 * https://elevenlabs.io/docs (Text to Speech quickstart)
 *
 *   npx tsx scripts/elevenlabs-tts-example.mts
 *   # or: npm run elevenlabs:tts-example
 *
 * Requires ELEVENLABS_API_KEY in repo-root .env
 * The SDK `play()` helper needs ffplay (ffmpeg) on your PATH to hear audio in the terminal.
 */
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

async function main() {
  const elevenlabs = new ElevenLabsClient();
  // apiKey defaults to process.env.ELEVENLABS_API_KEY

  const audio = await elevenlabs.textToSpeech.convert(
    "JBFqnCBsd6RMkjVDRZzb", // "George" — browse voices at elevenlabs.io/app/voice-library
    {
      text: "The first move is what sets everything in motion.",
      modelId: "eleven_v3",
      outputFormat: "mp3_44100_128",
    },
  );

  await play(audio);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
