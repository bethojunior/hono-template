-- AlterEnum
ALTER TYPE "EventStatus" ADD VALUE 'DEAD_LETTER';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextRetryAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "events_status_nextRetryAt_idx" ON "events"("status", "nextRetryAt");
