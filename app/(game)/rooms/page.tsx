import { RoomsClient } from "@/components/game/RoomsClient";

export default function RoomsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Rooms
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Spaces for Archie &amp; Zeke
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Unlock rooms with coins and stars—each one is built for two dogs and
          one heart.
        </p>
      </header>
      <RoomsClient />
    </main>
  );
}
