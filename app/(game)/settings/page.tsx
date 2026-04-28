import { SettingsClient } from "@/components/game/SettingsClient";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Settings
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Comfort &amp; care
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Tune sound, motion, and saves. Everything stays on your device first,
          with an optional local database sync when available.
        </p>
      </header>
      <SettingsClient />
    </main>
  );
}
