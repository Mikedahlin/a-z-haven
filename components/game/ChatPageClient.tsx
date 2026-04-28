"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatPanel } from "@/components/game/ChatPanel";
import { useGameStore } from "@/store/game-store";

export function ChatPageClient() {
  const router = useRouter();
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <Link
          href="/hub"
          className="min-h-[48px] rounded-full border border-cozy-cocoa/15 bg-white/80 px-4 py-2 text-sm font-semibold text-cozy-cocoa shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Back to Home
        </Link>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-cozy-cocoa/45">
          A-Z | Chat
        </p>
        <span className="w-[4.5rem]" aria-hidden />
      </div>
      <ChatPanel
        open
        layout="inline"
        onClose={() => router.push("/hub")}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
