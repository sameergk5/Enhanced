-- CreateTable: reward milestone system for Task 6.3
-- Virtual items for gamification
CREATE TABLE "virtual_items"
(
	"id" TEXT NOT NULL,
	"itemType" TEXT NOT NULL,
	"itemId" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"imageUrl" TEXT,
	"rarity" TEXT NOT NULL DEFAULT 'common',
	"category" TEXT NOT NULL,
	"metadata" JSONB,
	"isActive" BOOLEAN NOT NULL DEFAULT true,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "virtual_items_pkey" PRIMARY KEY ("id")
);

-- Reward milestones system
CREATE TABLE "reward_milestones"
(
	"id" TEXT NOT NULL,
	"milestoneType" TEXT NOT NULL,
	"threshold" INTEGER NOT NULL,
	"virtualItemId" TEXT NOT NULL,
	"title" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"isActive" BOOLEAN NOT NULL DEFAULT true,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "reward_milestones_pkey" PRIMARY KEY ("id")
);

-- User's virtual item inventory
CREATE TABLE "user_virtual_items"
(
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"virtualItemId" TEXT NOT NULL,
	"obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"source" TEXT NOT NULL DEFAULT 'reward',
	"isEquipped" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "user_virtual_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_items_itemType_itemId_key" ON "virtual_items"("itemType", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "reward_milestones_milestoneType_threshold_key" ON "reward_milestones"("milestoneType", "threshold");

-- CreateIndex
CREATE UNIQUE INDEX "user_virtual_items_userId_virtualItemId_key" ON "user_virtual_items"("userId", "virtualItemId");

-- AddForeignKey
ALTER TABLE "reward_milestones" ADD CONSTRAINT "reward_milestones_virtualItemId_fkey" FOREIGN KEY ("virtualItemId") REFERENCES "virtual_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_virtual_items" ADD CONSTRAINT "user_virtual_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_virtual_items" ADD CONSTRAINT "user_virtual_items_virtualItemId_fkey" FOREIGN KEY ("virtualItemId") REFERENCES "virtual_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
