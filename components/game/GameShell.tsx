"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { GameNav } from "@/components/game/GameNav";
import { ChatFab } from "@/components/game/ChatFab";
import { ChatPanel } from "@/components/game/ChatPanel";
import { GameSync } from "@/components/game/GameSync";
import { AmbientAudio } from "@/components/game/AmbientAudio";
import { useGameStore } from "@/store/game-store";

export function GameShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const { soundEnabled, musicEnabled, reducedMotion } = useGameStore(
    useShallow((s) => ({
      soundEnabled: s.soundEnabled,
      musicEnabled: s.musicEnabled,
      reducedMotion: s.reducedMotion,
    })),
  );
  const onChatRoute = pathname === "/chat";

  return (
    <>
      <GameSync />
      <AmbientAudio enabled={soundEnabled && musicEnabled} />
      <div id="main-content" className="pb-28 pt-4 sm:pb-32">
        {children}
      </div>
      <GameNav />
      {!onChatRoute && (
        <ChatFab
          reducedMotion={reducedMotion}
          onClick={() => setChatOpen(true)}
        />
      )}
      {!onChatRoute && (
        <ChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          soundEnabled={soundEnabled}
        />
      )}
    </>
  );
}
