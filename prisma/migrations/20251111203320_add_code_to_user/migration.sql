-- AlterTable
ALTER TABLE "users" ADD COLUMN     "code" VARCHAR(10),
ADD COLUMN     "codeExpiresAt" TIMESTAMP(3);
