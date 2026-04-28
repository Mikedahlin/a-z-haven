import type { PetProfileSnapshot, AgeVibe } from "./types";

const MAX_NAME = 40;
const MAX_TYPE = 40;
const MAX_BIO = 500;
const MAX_PERSONALITY = 2000;
const MAX_IMAGE = 1_500_000;
const MAX_TAGS = 12;
const MAX_TAG = 32;

export type SanitizedPetPayload = {
  id?: string;
  petType: string;
  petName: string;
  bio: string | null;
  personality: string;
  ageVibe: AgeVibe;
  tags: string[];
  imageUrl: string | null;
};

export function sanitizePetProfile(input: unknown): SanitizedPetPayload | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const petName = String(o.petName ?? o.name ?? "").trim().slice(0, MAX_NAME);
  const petType = String(o.petType ?? o.species ?? "").trim().slice(0, MAX_TYPE);
  if (!petName.length || !petType.length) return null;

  const bioRaw = o.bio;
  const bio =
    typeof bioRaw === "string" && bioRaw.trim().length
      ? bioRaw.trim().slice(0, MAX_BIO)
      : null;

  const ageVibe: AgeVibe = o.ageVibe === "older" ? "older" : "younger";

  const tagsRaw = Array.isArray(o.tags) ? o.tags : [];
  const tags = tagsRaw
    .slice(0, MAX_TAGS)
    .map((t) => String(t).trim().slice(0, MAX_TAG))
    .filter(Boolean);

  let personality = "";
  if (typeof o.personality === "string" && o.personality.trim().length) {
    personality = o.personality.trim().slice(0, MAX_PERSONALITY);
  } else {
    personality = JSON.stringify({
      ageVibe,
      tags,
      bio,
      flavor: "a-z-haven-v1",
    }).slice(0, MAX_PERSONALITY);
  }

  let imageUrl: string | null = null;
  const img = o.imageUrl ?? o.photoUrl;
  if (typeof img === "string" && img.length > 0) {
    const u = img.trim();
    if (u.length > MAX_IMAGE) return null;
    if (
      u.startsWith("https://") ||
      u.startsWith("/") ||
      u.startsWith("data:image/")
    ) {
      imageUrl = u;
    }
  }

  const id = typeof o.id === "string" && o.id.length < 80 ? o.id : undefined;

  return {
    id,
    petType,
    petName,
    bio,
    personality,
    ageVibe,
    tags,
    imageUrl,
  };
}

export function snapshotFromSanitized(
  s: SanitizedPetPayload,
  onboardingComplete: boolean,
): PetProfileSnapshot {
  return {
    id: s.id,
    petType: s.petType,
    petName: s.petName,
    bio: s.bio,
    personality: s.personality,
    ageVibe: s.ageVibe,
    tags: s.tags,
    imageUrl: s.imageUrl,
    onboardingComplete,
  };
}

export function parsePersonalityBlob(
  raw: string,
): { ageVibe: AgeVibe; tags: string[] } {
  try {
    const j = JSON.parse(raw) as {
      ageVibe?: string;
      tags?: string[];
    };
    return {
      ageVibe: j.ageVibe === "older" ? "older" : "younger",
      tags: Array.isArray(j.tags) ? j.tags.map(String) : [],
    };
  } catch {
    return { ageVibe: "younger", tags: [] };
  }
}
