import { PrismaClient } from "@prisma/client";
import { getDefaultGameState } from "../lib/game-state";
import type { ClientGameState } from "../lib/types";

const prisma = new PrismaClient();

async function main() {
  const base = getDefaultGameState();
  const personality = JSON.stringify({
    ageVibe: "younger",
    tags: ["gentle", "curious"],
    bio: "A gentle seed companion for local dev.",
    flavor: "seed",
  });

  await prisma.gameSave.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      data: JSON.stringify(base),
    },
    update: {},
  });

  await prisma.petProfile.upsert({
    where: { gameSaveId: "default" },
    create: {
      gameSaveId: "default",
      petType: "Dog",
      petName: "Willow",
      personality,
      bio: "A gentle seed companion for local dev.",
      imageUrl: null,
    },
    update: {
      petType: "Dog",
      petName: "Willow",
      personality,
      bio: "A gentle seed companion for local dev.",
    },
  });

  const pet = await prisma.petProfile.findUnique({
    where: { gameSaveId: "default" },
  });
  if (!pet) throw new Error("PetProfile seed failed");

  const state: ClientGameState = {
    ...base,
    version: 3,
    petProfile: {
      id: pet.id,
      petType: pet.petType,
      petName: pet.petName,
      bio: pet.bio,
      personality: pet.personality,
      ageVibe: "younger",
      tags: ["gentle", "curious"],
      imageUrl: pet.imageUrl,
      onboardingComplete: true,
    },
  };

  await prisma.gameSave.update({
    where: { id: "default" },
    data: { data: JSON.stringify(state) },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
