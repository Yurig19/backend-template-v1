/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "logs" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";
