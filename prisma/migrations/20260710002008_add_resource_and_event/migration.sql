-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'PROCESSING', 'PROCESSED', 'FAILED_PUBLISH', 'FAILED_PROCESSING');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resourceId" TEXT;

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aggregateId" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "failedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_aggregateId_idx" ON "events"("aggregateId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
