-- CreateTable
CREATE TABLE "GameSave" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "preview" TEXT NOT NULL,

    CONSTRAINT "ChatAudit_pkey" PRIMARY KEY ("id")
);
