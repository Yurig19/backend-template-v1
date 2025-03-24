-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleUuid" TEXT;

-- CreateTable
CREATE TABLE "roles" (
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "type" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
