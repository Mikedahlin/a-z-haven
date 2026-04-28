import { ScrapbookClient } from "@/components/game/ScrapbookClient";

export default function ScrapbookPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Scrapbook
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Little memories
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Pages unlock gently as you gather stars—each one is only about Archie
          and Zeke.
        </p>
      </header>
      <ScrapbookClient />
    </main>
  );
}
