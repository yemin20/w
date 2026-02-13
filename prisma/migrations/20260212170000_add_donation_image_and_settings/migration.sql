-- AlterTable
ALTER TABLE "DonationCategory" ADD COLUMN "image" TEXT;

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
