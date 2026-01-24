/*
  Warnings:

  - You are about to drop the column `codeExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `codeHash` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "codeExpiresAt",
DROP COLUMN "codeHash";

-- CreateTable
CREATE TABLE "passwordResets" (
    "uuid" TEXT NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "userUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordResets_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "passwordResets_userUuid_idx" ON "passwordResets"("userUuid");

-- CreateIndex
CREATE INDEX "passwordResets_expiresAt_idx" ON "passwordResets"("expiresAt");

-- AddForeignKey
ALTER TABLE "passwordResets" ADD CONSTRAINT "passwordResets_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
