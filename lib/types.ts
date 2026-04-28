export type RoomId =
  | "sleeping"
  | "living"
  | "backyard"
  | "kitchen"
  | "bath"
  | "seasonal"
  | "birthday"
  | "memory";

export type PetMood =
  | "idle"
  | "happy"
  | "playful"
  | "sleepy"
  | "excited"
  | "snuggly";

export type AgeVibe = "younger" | "older";

export interface PetPresentation {
  mood: PetMood;
  lastReactionAt: number;
  /** 0–100 Tamagotchi-style warmth meter */
  happiness: number;
}

/** Mirrors Prisma PetProfile + client-only fields */
export interface PetProfileSnapshot {
  id?: string;
  petType: string;
  petName: string;
  /** Short bio / flavor text */
  bio: string | null;
  /** Structured + tag string for AI (JSON or prose) */
  personality: string;
  ageVibe: AgeVibe;
  tags: string[];
  /** HTTPS URL or data:image base64 preview */
  imageUrl: string | null;
  onboardingComplete: boolean;
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  description: string;
  unlockCost: { coins: number; stars: number };
  flavor: string;
}

export interface DecorItem {
  id: string;
  name: string;
  roomId: RoomId;
  costDecorTokens: number;
  slot: "floor" | "wall" | "accent";
  /** Shop item id that must be owned (coins or Stripe) before placing */
  requiresPremiumId?: string;
}

export interface ScrapbookEntry {
  id: string;
  title: string;
  body: string;
  unlockStars: number;
  roomHint: RoomId;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface ClientGameState {
  version: 3;
  coins: number;
  treats: number;
  bones: number;
  decorTokens: number;
  stars: number;
  puzzleLevel: number;
  puzzleBestScore: number;
  /** Highest puzzle tier (10, 20, …) for which the milestone story was dismissed */
  puzzleStoryLastMilestone: number;
  unlockedRooms: RoomId[];
  selectedRoom: RoomId;
  placedDecor: Partial<Record<RoomId, string>>;
  ownedDecorIds: string[];
  /** Stripe / premium cosmetic IDs unlocked (never pay-to-win) */
  premiumUnlockedIds: string[];
  scrapbookUnlockedIds: string[];
  pet: PetPresentation;
  petProfile: PetProfileSnapshot;
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  hasSeenWelcome: boolean;
  lastDailyGreetingAt?: string;
}

export type RewardType =
  | "treats"
  | "bones"
  | "coins"
  | "decorTokens"
  | "stars";

export interface RewardGrant {
  treats?: number;
  bones?: number;
  coins?: number;
  decorTokens?: number;
  stars?: number;
}
