import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ClientGameState, PetProfileSnapshot } from "@/lib/types";
import { getDefaultGameState, migrateClientState } from "@/lib/game-state";
import {
  sanitizePetProfile,
  snapshotFromSanitized,
  parsePersonalityBlob,
  type SanitizedPetPayload,
} from "@/lib/pet-validation";

export const runtime = "nodejs";

function parseState(raw: string | null): ClientGameState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    return migrateClientState(data);
  } catch {
    return null;
  }
}

function petFromDb(
  row: {
    id: string;
    petType: string;
    petName: string;
    personality: string;
    bio: string | null;
    imageUrl: string | null;
  },
  onboardingComplete: boolean,
  fallback: PetProfileSnapshot,
): PetProfileSnapshot {
  const parsed = parsePersonalityBlob(row.personality);
  const looksJson = row.personality.trim().startsWith("{");
  return {
    id: row.id,
    petType: row.petType,
    petName: row.petName,
    personality: row.personality,
    bio: row.bio,
    ageVibe: looksJson ? parsed.ageVibe : fallback.ageVibe,
    tags: looksJson && parsed.tags.length ? parsed.tags : fallback.tags,
    imageUrl: row.imageUrl,
    onboardingComplete,
  };
}

async function upsertPetForSave(
  tx: Prisma.TransactionClient,
  gameSaveId: string,
  sanitized: SanitizedPetPayload,
): Promise<string> {
  const existing = await tx.petProfile.findUnique({
    where: { gameSaveId },
  });
  const data = {
    petType: sanitized.petType,
    petName: sanitized.petName,
    personality: sanitized.personality,
    bio: sanitized.bio,
    imageUrl: sanitized.imageUrl,
  };

  if (existing) {
    await tx.petProfile.update({
      where: { gameSaveId },
      data,
    });
    return existing.id;
  }

  const created = await tx.petProfile.create({
    data: {
      gameSaveId,
      ...data,
    },
  });
  return created.id;
}

export async function GET() {
  try {
    const row = await prisma.gameSave.findUnique({
      where: { id: "default" },
      include: { petProfile: true },
    });
    const state = parseState(row?.data ?? null) ?? getDefaultGameState();
    let petProfile = state.petProfile;
    if (row?.petProfile) {
      petProfile = petFromDb(
        row.petProfile,
        state.petProfile.onboardingComplete,
        state.petProfile,
      );
    }
    const merged: ClientGameState = { ...state, version: 3, petProfile };
    return NextResponse.json({
      state: merged,
      petProfileId: row?.petProfile?.id ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { state: getDefaultGameState(), warning: "db_unavailable" },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const state = (body as { state?: ClientGameState }).state;
  const petRaw = (body as { petProfile?: unknown }).petProfile;
  if (!state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const mergedState = migrateClientState(state);
  const sanitized = sanitizePetProfile(petRaw ?? mergedState.petProfile);

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.gameSave.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          data: JSON.stringify(mergedState),
        },
        update: {
          data: JSON.stringify(mergedState),
        },
      });

      if (!sanitized) {
        return { petId: null as string | null };
      }

      const petId = await upsertPetForSave(tx, "default", sanitized);
      const snapshot = snapshotFromSanitized(
        { ...sanitized, id: petId },
        mergedState.petProfile.onboardingComplete,
      );
      const stateToStore: ClientGameState = {
        ...mergedState,
        petProfile: snapshot,
      };

      await tx.gameSave.update({
        where: { id: "default" },
        data: { data: JSON.stringify(stateToStore) },
      });

      return { petId };
    });

    return NextResponse.json({ ok: true, petProfileId: result.petId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
