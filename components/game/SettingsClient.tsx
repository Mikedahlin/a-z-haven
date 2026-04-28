"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";

export function SettingsClient() {
  const [health, setHealth] = useState<{
    openaiConfigured: boolean;
    databaseConfigured: boolean;
    elevenlabsConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) return;
        const data = (await res.json()) as {
          openaiConfigured?: boolean;
          databaseConfigured?: boolean;
          elevenlabsConfigured?: boolean;
        };
        if (!cancelled) {
          setHealth({
            openaiConfigured: Boolean(data.openaiConfigured),
            databaseConfigured: Boolean(data.databaseConfigured),
            elevenlabsConfigured: Boolean(data.elevenlabsConfigured),
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const setMusicEnabled = useGameStore((s) => s.setMusicEnabled);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const reset = useGameStore((s) => s.reset);

  return (
    <div className="space-y-4 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-card">
      {health && (
        <div className="space-y-2 rounded-2xl border border-cozy-cocoa/10 bg-amber-50/80 px-4 py-3 text-sm text-cozy-cocoa/90">
          <p className="font-semibold text-cozy-cocoa">Connection status</p>
          <ul className="list-inside list-disc space-y-1 text-cozy-cocoa/80">
            <li>
              Pet chat (OpenAI):{" "}
              {health.openaiConfigured ? (
                <span className="text-emerald-800">ready</span>
              ) : (
                <span>
                  not configured — add{" "}
                  <code className="rounded bg-white/80 px-1 text-xs">OPENAI_API_KEY</code>{" "}
                  in <code className="rounded bg-white/80 px-1 text-xs">.env</code> and
                  restart the dev server
                </span>
              )}
            </li>
            <li>
              Cloud save (database):{" "}
              {health.databaseConfigured ? (
                <span className="text-emerald-800">URL set</span>
              ) : (
                <span>
                  <code className="rounded bg-white/80 px-1 text-xs">DATABASE_URL</code>{" "}
                  missing — run Docker Postgres and copy{" "}
                  <code className="rounded bg-white/80 px-1 text-xs">.env.example</code>
                </span>
              )}
            </li>
            <li>
              Read-aloud (ElevenLabs):{" "}
              {health.elevenlabsConfigured ? (
                <span className="text-emerald-800">ready</span>
              ) : (
                <span>
                  optional — add{" "}
                  <code className="rounded bg-white/80 px-1 text-xs">ELEVENLABS_API_KEY</code>{" "}
                  for &quot;Listen&quot; in chat
                </span>
              )}
            </li>
          </ul>
        </div>
      )}
      <Toggle
        label="UI sounds"
        description="Soft taps and tiny celebrations—no files required."
        checked={soundEnabled}
        onChange={setSoundEnabled}
      />
      <Toggle
        label="Ambient music"
        description="Optional loop from /audio/ambient-cozy.mp3 when added."
        checked={musicEnabled}
        onChange={setMusicEnabled}
      />
      <Toggle
        label="Reduce motion"
        description="Less movement for comfort and accessibility."
        checked={reducedMotion}
        onChange={setReducedMotion}
      />
      <div className="border-t border-cozy-cocoa/10 pt-4">
        <button
          type="button"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm(
                "Reset all local progress? This cannot be undone here.",
              )
            ) {
              reset();
              window.localStorage.removeItem("a-z-haven-save");
              window.localStorage.removeItem("archie-zeke-save");
              window.location.reload();
            }
          }}
          className="w-full rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-800"
        >
          Reset local save
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-cozy-cocoa/10 bg-white/70 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-cozy-cocoa">{label}</span>
        <span className="mt-1 block text-xs text-cozy-cocoa/60">{description}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-6 w-11 accent-cozy-cocoa"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
