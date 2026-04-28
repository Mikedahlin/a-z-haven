-- Redesign: PetProfile references GameSave (inverse FK). Cosmetic-only unlocks stay in JSON.

ALTER TABLE "GameSave" DROP CONSTRAINT IF EXISTS "GameSave_petProfileId_fkey";
DROP INDEX IF EXISTS "GameSave_petProfileId_key";

ALTER TABLE "GameSave" DROP COLUMN IF EXISTS "petProfileId";

DROP TABLE IF EXISTS "PetProfile";

CREATE TABLE "PetProfile" (
    "id" TEXT NOT NULL,
    "gameSaveId" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "petName" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetProfile_gameSaveId_key" ON "PetProfile"("gameSaveId");

ALTER TABLE "PetProfile" ADD CONSTRAINT "PetProfile_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "GameSave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PendingCheckout" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "PendingCheckout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendingCheckout_sessionId_key" ON "PendingCheckout"("sessionId");
