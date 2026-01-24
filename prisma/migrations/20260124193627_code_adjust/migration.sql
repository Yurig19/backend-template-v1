/*
  Warnings:

  - You are about to drop the column `code` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "code",
ADD COLUMN     "codeHash" CHAR(64);
