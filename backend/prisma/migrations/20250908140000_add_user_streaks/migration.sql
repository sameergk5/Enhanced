-- CreateTable: user_streaks for Task 6.1
CREATE TABLE "user_streaks"
(
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"currentStreak" INTEGER NOT NULL DEFAULT 0,
	"longestStreak" INTEGER NOT NULL DEFAULT 0,
	"lastActivityAt" TIMESTAMP(3),
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_userId_key" ON "user_streaks"("userId");

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
