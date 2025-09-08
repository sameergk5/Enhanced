-- CreateTable
CREATE TABLE "wardrobe_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareWardrobePublic" BOOLEAN NOT NULL DEFAULT false,
    "allowOutfitSharing" BOOLEAN NOT NULL DEFAULT true,
    "allowAvatarDownloads" BOOLEAN NOT NULL DEFAULT false,
    "allowLookRating" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonymousViews" BOOLEAN NOT NULL DEFAULT false,
    "advancedRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wardrobe_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wardrobe_permissions_userId_key" ON "wardrobe_permissions"("userId");

-- AddForeignKey
ALTER TABLE "wardrobe_permissions" ADD CONSTRAINT "wardrobe_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
