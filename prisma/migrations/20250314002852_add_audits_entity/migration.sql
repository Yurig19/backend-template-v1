-- CreateTable
CREATE TABLE "audits" (
    "uuid" TEXT NOT NULL,
    "entity" TEXT,
    "method" TEXT,
    "userUuid" TEXT,
    "oldData" TEXT,
    "newData" TEXT,
    "url" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "audits_uuid_key" ON "audits"("uuid");

-- CreateIndex
CREATE INDEX "audits_entity_idx" ON "audits"("entity");

-- CreateIndex
CREATE INDEX "audits_userUuid_idx" ON "audits"("userUuid");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
