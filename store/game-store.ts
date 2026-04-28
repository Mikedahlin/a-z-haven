"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getDefaultGameState, migrateClientState } from "@/lib/game-state";
import type {
  ClientGameState,
  PetMood,
  PetProfileSnapshot,
  RoomId,
} from "@/lib/types";
import { ROOMS } from "@/lib/content/rooms";
import { DECOR } from "@/lib/content/decor";
import { SCRAPBOOK } from "@/lib/content/scrapbook";

type GameStore = ClientGameState & {
  grantRewards: (r: {
    treats?: number;
    bones?: number;
    coins?: number;
    decorTokens?: number;
    stars?: number;
  }) => void;
  spend: (r: {
    coins?: number;
    decorTokens?: number;
    stars?: number;
  }) => boolean;
  unlockRoom: (id: RoomId) => boolean;
  setRoom: (id: RoomId) => void;
  placeDecor: (decorId: string) => boolean;
  recordPuzzleScore: (score: number) => void;
  setPetMood: (mood: PetMood) => void;
  setHappiness: (n: number) => void;
  bumpHappiness: (delta: number) => void;
  applyPetReaction: (kind: "treat" | "play" | "puzzle" | "rest") => void;
  setPetProfile: (p: Partial<PetProfileSnapshot>) => void;
  completePetOnboarding: () => void;
  unlockPremiumCosmetic: (id: string) => void;
  markPuzzleStorySeen: (milestone: number) => void;
  /** Once per calendar day: small warmth bonus (coins + treat). */
  claimDailyBonus: () => { ok: boolean; reason?: "already" };
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setWelcomeSeen: () => void;
  reset: () => void;
  hydrateFromServer: (s: ClientGameState) => void;
};

function clampHappy(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function canUnlock(state: ClientGameState, id: RoomId) {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) return false;
  if (state.unlockedRooms.includes(id)) return false;
  return (
    state.coins >= room.unlockCost.coins &&
    state.stars >= room.unlockCost.stars
  );
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getDefaultGameState(),
      grantRewards: (r) =>
        set((s) => {
          const nextStars = s.stars + (r.stars ?? 0);
          const unlocks = new Set(s.scrapbookUnlockedIds);
          for (const e of SCRAPBOOK) {
            if (nextStars >= e.unlockStars) unlocks.add(e.id);
          }
          return {
            treats: s.treats + (r.treats ?? 0),
            bones: s.bones + (r.bones ?? 0),
            coins: s.coins + (r.coins ?? 0),
            decorTokens: s.decorTokens + (r.decorTokens ?? 0),
            stars: nextStars,
            scrapbookUnlockedIds: [...unlocks],
          };
        }),
      spend: (r) => {
        const s = get();
        const coins = r.coins ?? 0;
        const decorTokens = r.decorTokens ?? 0;
        const stars = r.stars ?? 0;
        if (s.coins < coins || s.decorTokens < decorTokens || s.stars < stars)
          return false;
        set({
          coins: s.coins - coins,
          decorTokens: s.decorTokens - decorTokens,
          stars: s.stars - stars,
        });
        return true;
      },
      unlockRoom: (id) => {
        const s = get();
        if (!canUnlock(s, id)) return false;
        const room = ROOMS.find((r) => r.id === id)!;
        set({
          coins: s.coins - room.unlockCost.coins,
          stars: s.stars - room.unlockCost.stars,
          unlockedRooms: [...new Set([...s.unlockedRooms, id])],
        });
        return true;
      },
      setRoom: (id) => {
        const s = get();
        if (!s.unlockedRooms.includes(id)) return;
        set({ selectedRoom: id });
      },
      placeDecor: (decorId) => {
        const s = get();
        const item = DECOR.find((d) => d.id === decorId);
        if (!item) return false;
        if (!s.unlockedRooms.includes(item.roomId)) return false;
        if (
          item.requiresPremiumId &&
          !s.premiumUnlockedIds.includes(item.requiresPremiumId)
        ) {
          return false;
        }
        const alreadyOwned = s.ownedDecorIds.includes(decorId);
        if (item.costDecorTokens > 0 && !alreadyOwned) {
          if (!get().spend({ decorTokens: item.costDecorTokens })) return false;
        }
        set((st) => ({
          placedDecor: { ...st.placedDecor, [item.roomId]: decorId },
          ownedDecorIds: alreadyOwned
            ? st.ownedDecorIds
            : [...st.ownedDecorIds, decorId],
        }));
        return true;
      },
      recordPuzzleScore: (score) =>
        set((s) => ({
          puzzleBestScore: Math.max(s.puzzleBestScore, score),
          puzzleLevel: Math.max(s.puzzleLevel, Math.floor(score / 280) + 1),
        })),
      setPetMood: (mood) =>
        set((s) => ({
          pet: { ...s.pet, mood, lastReactionAt: Date.now() },
        })),
      setHappiness: (n) =>
        set((s) => ({
          pet: { ...s.pet, happiness: clampHappy(n) },
        })),
      bumpHappiness: (delta) =>
        set((s) => ({
          pet: {
            ...s.pet,
            happiness: clampHappy(s.pet.happiness + delta),
          },
        })),
      applyPetReaction: (kind) =>
        set((s) => {
          const d =
            kind === "treat"
              ? 6
              : kind === "play"
                ? 5
                : kind === "puzzle"
                  ? 4
                  : 2;
          const mood: PetMood =
            kind === "rest"
              ? "snuggly"
              : kind === "puzzle"
                ? "playful"
                : "happy";
          return {
            pet: {
              mood,
              lastReactionAt: Date.now(),
              happiness: clampHappy(s.pet.happiness + d),
            },
          };
        }),
      setPetProfile: (p) =>
        set((s) => ({
          petProfile: { ...s.petProfile, ...p },
        })),
      completePetOnboarding: () =>
        set((s) => ({
          petProfile: { ...s.petProfile, onboardingComplete: true },
        })),
      unlockPremiumCosmetic: (id) =>
        set((s) => ({
          premiumUnlockedIds: s.premiumUnlockedIds.includes(id)
            ? s.premiumUnlockedIds
            : [...s.premiumUnlockedIds, id],
        })),
      markPuzzleStorySeen: (milestone) =>
        set((s) => ({
          puzzleStoryLastMilestone: Math.max(
            s.puzzleStoryLastMilestone,
            milestone,
          ),
        })),
      claimDailyBonus: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        if (s.lastDailyGreetingAt === today) {
          return { ok: false, reason: "already" };
        }
        set({
          lastDailyGreetingAt: today,
          coins: s.coins + 15,
          treats: s.treats + 2,
        });
        return { ok: true };
      },
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setWelcomeSeen: () => set({ hasSeenWelcome: true }),
      reset: () => set(getDefaultGameState()),
      hydrateFromServer: (data) =>
        set(() => {
          const merged = migrateClientState(data);
          const unlocks = new Set(merged.scrapbookUnlockedIds);
          for (const e of SCRAPBOOK) {
            if (merged.stars >= e.unlockStars) unlocks.add(e.id);
          }
          return {
            ...merged,
            version: 3,
            scrapbookUnlockedIds: [...unlocks],
          };
        }),
    }),
    {
      name: "a-z-haven-save",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        version: s.version,
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
        premiumUnlockedIds: s.premiumUnlockedIds,
        scrapbookUnlockedIds: s.scrapbookUnlockedIds,
        pet: s.pet,
        petProfile: s.petProfile,
        soundEnabled: s.soundEnabled,
        musicEnabled: s.musicEnabled,
        reducedMotion: s.reducedMotion,
        hasSeenWelcome: s.hasSeenWelcome,
        lastDailyGreetingAt: s.lastDailyGreetingAt,
      }),
    },
  ),
);
