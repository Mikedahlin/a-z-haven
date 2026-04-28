import type { ClientGameState, PetProfileSnapshot, RoomId, AgeVibe } from "./types";

const START_ROOMS: RoomId[] = ["sleeping", "living"];

export function defaultPetProfile(): PetProfileSnapshot {
  return {
    petType: "",
    petName: "",
    bio: null,
    personality: "{}",
    ageVibe: "younger",
    tags: [],
    imageUrl: null,
    onboardingComplete: false,
  };
}

export function getDefaultGameState(): ClientGameState {
  return {
    version: 3,
    coins: 40,
    treats: 6,
    bones: 4,
    decorTokens: 2,
    stars: 1,
    puzzleLevel: 1,
    puzzleBestScore: 0,
    puzzleStoryLastMilestone: 0,
    unlockedRooms: START_ROOMS,
    selectedRoom: "living",
    placedDecor: {
      living: "woven-bed",
    },
    ownedDecorIds: ["woven-bed"],
    premiumUnlockedIds: [],
    scrapbookUnlockedIds: ["first-tail-wag"],
    pet: { mood: "happy", lastReactionAt: 0, happiness: 72 },
    petProfile: defaultPetProfile(),
    soundEnabled: true,
    musicEnabled: true,
    reducedMotion: false,
    hasSeenWelcome: false,
  };
}

function clampHappy(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Normalize any prior version into v3. */
export function migrateClientState(raw: unknown): ClientGameState {
  const fresh = getDefaultGameState();
  if (!raw || typeof raw !== "object") return fresh;
  const o = raw as Record<string, unknown>;
  const ver = o.version;

  if (ver === 3) {
    const pp = o.petProfile as PetProfileSnapshot | undefined;
    const pet = o.pet as ClientGameState["pet"] | undefined;
    return {
      ...fresh,
      coins: num(o.coins, fresh.coins),
      treats: num(o.treats, fresh.treats),
      bones: num(o.bones, fresh.bones),
      decorTokens: num(o.decorTokens, fresh.decorTokens),
      stars: num(o.stars, fresh.stars),
      puzzleLevel: num(o.puzzleLevel, fresh.puzzleLevel),
      puzzleBestScore: num(o.puzzleBestScore, fresh.puzzleBestScore),
      puzzleStoryLastMilestone: num(
        (o as { puzzleStoryLastMilestone?: number }).puzzleStoryLastMilestone,
        fresh.puzzleStoryLastMilestone,
      ),
      unlockedRooms: (o.unlockedRooms as RoomId[]) ?? fresh.unlockedRooms,
      selectedRoom: (o.selectedRoom as RoomId) ?? fresh.selectedRoom,
      placedDecor: (o.placedDecor as ClientGameState["placedDecor"]) ?? fresh.placedDecor,
      ownedDecorIds: (o.ownedDecorIds as string[]) ?? fresh.ownedDecorIds,
      premiumUnlockedIds:
        (o.premiumUnlockedIds as string[]) ?? fresh.premiumUnlockedIds,
      scrapbookUnlockedIds:
        (o.scrapbookUnlockedIds as string[]) ?? fresh.scrapbookUnlockedIds,
      pet: pet
        ? {
            mood: pet.mood ?? fresh.pet.mood,
            lastReactionAt: num(pet.lastReactionAt, fresh.pet.lastReactionAt),
            happiness: clampHappy(
              num((pet as { happiness?: number }).happiness, fresh.pet.happiness),
            ),
          }
        : fresh.pet,
      petProfile: pp
        ? {
            id: pp.id,
            petType: String(pp.petType ?? (pp as { species?: string }).species ?? ""),
            petName: String(pp.petName ?? (pp as { name?: string }).name ?? ""),
            bio: pp.bio ?? null,
            personality: String(pp.personality ?? "{}"),
            ageVibe: pp.ageVibe === "older" ? "older" : "younger",
            tags: Array.isArray(pp.tags) ? pp.tags.map(String) : [],
            imageUrl: pp.imageUrl ?? null,
            onboardingComplete: Boolean(pp.onboardingComplete),
          }
        : fresh.petProfile,
      soundEnabled: bool(o.soundEnabled, fresh.soundEnabled),
      musicEnabled: bool(o.musicEnabled, fresh.musicEnabled),
      reducedMotion: bool(o.reducedMotion, fresh.reducedMotion),
      hasSeenWelcome: bool(o.hasSeenWelcome, fresh.hasSeenWelcome),
      lastDailyGreetingAt: o.lastDailyGreetingAt as string | undefined,
    };
  }

  if (ver === 2) {
    const premiumUnlockedIds = (o.premiumUnlockedIds as string[]) ?? fresh.premiumUnlockedIds;
    const old = o.petProfile as Record<string, unknown> | undefined;
    const energy = old?.energy != null ? Number(old.energy) : 50;
    const traits = Array.isArray(old?.traits)
      ? (old!.traits as unknown[]).map(String)
      : [];
    const ageVibe: AgeVibe = energy < 45 ? "older" : "younger";
    const personality = JSON.stringify({
      energy,
      legacyTraits: traits,
      note: "migrated from v2",
    });
    return {
      ...fresh,
      version: 3,
      premiumUnlockedIds,
      coins: num(o.coins, fresh.coins),
      treats: num(o.treats, fresh.treats),
      bones: num(o.bones, fresh.bones),
      decorTokens: num(o.decorTokens, fresh.decorTokens),
      stars: num(o.stars, fresh.stars),
      puzzleLevel: num(o.puzzleLevel, fresh.puzzleLevel),
      puzzleBestScore: num(o.puzzleBestScore, fresh.puzzleBestScore),
      unlockedRooms: (o.unlockedRooms as RoomId[]) ?? fresh.unlockedRooms,
      selectedRoom: (o.selectedRoom as RoomId) ?? fresh.selectedRoom,
      placedDecor: (o.placedDecor as ClientGameState["placedDecor"]) ?? fresh.placedDecor,
      ownedDecorIds: (o.ownedDecorIds as string[]) ?? fresh.ownedDecorIds,
      scrapbookUnlockedIds:
        (o.scrapbookUnlockedIds as string[]) ?? fresh.scrapbookUnlockedIds,
      pet: {
        mood: "happy",
        lastReactionAt: 0,
        happiness: 70,
      },
      petProfile: {
        petType: String(old?.species ?? "dog"),
        petName: String(old?.name ?? "Companion"),
        bio: "Migrated from an earlier save.",
        personality,
        ageVibe,
        tags: traits.length ? traits : ["gentle"],
        imageUrl:
          typeof old?.photoUrl === "string" ? old.photoUrl : null,
        onboardingComplete: Boolean(old && String(old.name ?? "").length > 0),
      },
      soundEnabled: bool(o.soundEnabled, true),
      musicEnabled: bool(o.musicEnabled, true),
      reducedMotion: bool(o.reducedMotion, false),
      hasSeenWelcome: bool(o.hasSeenWelcome, false),
    };
  }

  if (ver === 1) {
    return {
      ...fresh,
      version: 3,
      coins: num(o.coins, fresh.coins),
      treats: num(o.treats, fresh.treats),
      bones: num(o.bones, fresh.bones),
      decorTokens: num(o.decorTokens, fresh.decorTokens),
      stars: num(o.stars, fresh.stars),
      puzzleLevel: num(o.puzzleLevel, fresh.puzzleLevel),
      puzzleBestScore: num(o.puzzleBestScore, fresh.puzzleBestScore),
      unlockedRooms: (o.unlockedRooms as RoomId[]) ?? fresh.unlockedRooms,
      selectedRoom: (o.selectedRoom as RoomId) ?? fresh.selectedRoom,
      placedDecor: (o.placedDecor as ClientGameState["placedDecor"]) ?? fresh.placedDecor,
      ownedDecorIds: (o.ownedDecorIds as string[]) ?? fresh.ownedDecorIds,
      scrapbookUnlockedIds:
        (o.scrapbookUnlockedIds as string[]) ?? fresh.scrapbookUnlockedIds,
      petProfile: {
        petType: "dog",
        petName: "Companion",
        bio: null,
        personality: "{}",
        ageVibe: "younger",
        tags: ["gentle", "curious"],
        imageUrl: null,
        onboardingComplete: true,
      },
      soundEnabled: bool(o.soundEnabled, true),
      musicEnabled: bool(o.musicEnabled, true),
      reducedMotion: bool(o.reducedMotion, false),
      hasSeenWelcome: bool(o.hasSeenWelcome, false),
    };
  }

  return fresh;
}

function num(v: unknown, d: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : d;
}

function bool(v: unknown, d: boolean): boolean {
  return typeof v === "boolean" ? v : d;
}
