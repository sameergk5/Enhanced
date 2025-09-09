/*
  Warnings:

  - You are about to drop the column `lastActivityAt` on the `user_streaks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WardrobeVisibility" AS ENUM ('private', 'friends', 'public');

-- AlterTable
ALTER TABLE "user_streaks" DROP COLUMN "lastActivityAt",
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "lastActivityType" TEXT,
ADD COLUMN     "totalActivities" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "wardrobeVisibility" "WardrobeVisibility" NOT NULL DEFAULT 'private';

-- CreateTable
CREATE TABLE "community_looks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT,
    "avatarImageUrl" TEXT,
    "lookData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "look_ratings" (
    "id" TEXT NOT NULL,
    "lookId" TEXT NOT NULL,
    "raterUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "look_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "look_ratings_lookId_raterUserId_key" ON "look_ratings"("lookId", "raterUserId");

-- AddForeignKey
ALTER TABLE "community_looks" ADD CONSTRAINT "community_looks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_looks" ADD CONSTRAINT "community_looks_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "outfits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "look_ratings" ADD CONSTRAINT "look_ratings_lookId_fkey" FOREIGN KEY ("lookId") REFERENCES "community_looks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "look_ratings" ADD CONSTRAINT "look_ratings_raterUserId_fkey" FOREIGN KEY ("raterUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
