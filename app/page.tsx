import Link from "next/link";
import { WelcomeClient } from "@/components/game/WelcomeClient";

export default function LandingPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-6 py-16"
    >
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cozy-cocoa/45">
          A-Z Haven
        </p>
        <h1 className="font-display text-4xl leading-tight text-cozy-cocoa text-pretty sm:text-5xl">
          Your pet, your story
        </h1>
        <p className="text-lg leading-relaxed text-cozy-cocoa/80">
          A premium cozy virtual pet home: create any companion, tune their
          personality, add optional photos, and chat with a warm AI that speaks
          in their voice, always relaxing and never rushed.
        </p>
      </div>

      <WelcomeClient />

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/hub"
          className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-full bg-cozy-cocoa px-8 py-3 text-base font-semibold text-cozy-cream shadow-glow transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Enter the Haven
        </Link>
        <Link
          href="/onboard"
          className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-full border border-cozy-cocoa/15 bg-white/70 px-8 py-3 text-base font-semibold text-cozy-cocoa shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Create Your Pet
        </Link>
      </div>

      <p className="text-center text-xs text-cozy-cocoa/45">
        Cosmetics only. OpenAI stays on the server.
      </p>
    </main>
  );
}
