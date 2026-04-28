-- CreateTable
CREATE TABLE "PetProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "energy" INTEGER NOT NULL DEFAULT 50,
    "traits" JSONB,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetProfile_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "GameSave" ADD COLUMN "petProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GameSave_petProfileId_key" ON "GameSave"("petProfileId");

-- AddForeignKey
ALTER TABLE "GameSave" ADD CONSTRAINT "GameSave_petProfileId_fkey" FOREIGN KEY ("petProfileId") REFERENCES "PetProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
