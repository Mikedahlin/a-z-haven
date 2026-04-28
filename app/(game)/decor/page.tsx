import { DecorClient } from "@/components/game/DecorClient";

export default function DecorPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Decor
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Place something lovely
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Choose decor for the room you have unlocked. Purchases are remembered—
          come back to your favorites anytime.
        </p>
      </header>
      <DecorClient />
    </main>
  );
}
