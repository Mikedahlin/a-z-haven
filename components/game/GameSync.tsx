"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/store/game-store";
import type { ClientGameState } from "@/lib/types";

export function GameSync() {
  const hydrateFromServer = useGameStore((s) => s.hydrateFromServer);
  const bundle = useGameStore(
    useShallow((s) => ({
      coins: s.coins,
      treats: s.treats,
      bones: s.bones,
      decorTokens: s.decorTokens,
      stars: s.stars,
      puzzleLevel: s.puzzleLevel,
      puzzleBestScore: s.puzzleBestScore,
      puzzleStoryLastMilestone: s.puzzleStoryLastMilestone,
      unlockedRooms: s.unlockedRooms,
      selectedRoom: s.selectedRoom,
      placedDecor: s.placedDecor,
      ownedDecorIds: s.ownedDecorIds,
      scrapbookUnlockedIds: s.scrapbookUnlockedIds,
      premiumUnlockedIds: s.premiumUnlockedIds,
      pet: s.pet,
      petProfile: s.petProfile,
      soundEnabled: s.soundEnabled,
      musicEnabled: s.musicEnabled,
      reducedMotion: s.reducedMotion,
      hasSeenWelcome: s.hasSeenWelcome,
      lastDailyGreetingAt: s.lastDailyGreetingAt,
    })),
  );

  const petProfile = useGameStore((s) => s.petProfile);
  const hydrated = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedPayload = useRef<string | null>(null);
  const inFlightRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window !== "undefined") {
          const hasLocal = !!window.localStorage.getItem("a-z-haven-save");
          if (hasLocal) return;
        }
        const res = await fetch("/api/gamestate");
        if (!res.ok) return;
        const data = (await res.json()) as {
          state: ClientGameState;
          warning?: string;
        };
        if (cancelled || hydrated.current) return;
        if (data.warning === "db_unavailable") return;
        hydrateFromServer(data.state);
        hydrated.current = true;
      } catch {
        /* offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateFromServer]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    const canSyncPet =
      petProfile.onboardingComplete || petProfile.petName.trim().length > 0;
    const snap: ClientGameState = {
      version: 3,
      ...bundle,
    };
    const payload: Record<string, unknown> = { state: snap };
    if (canSyncPet) {
      payload.petProfile = petProfile;
    }
    const body = JSON.stringify(payload);

    if (body === lastSyncedPayload.current) {
      return;
    }

    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      inFlightRequest.current?.abort();
      inFlightRequest.current = controller;

      try {
        const response = await fetch("/api/gamestate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal,
        });
        if (response.ok) {
          lastSyncedPayload.current = body;
        }
      } catch {
        /* ignore */
      } finally {
        if (inFlightRequest.current === controller) {
          inFlightRequest.current = null;
        }
      }
    }, 1200);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      inFlightRequest.current?.abort();
    };
  }, [bundle, petProfile]);

  return null;
}
