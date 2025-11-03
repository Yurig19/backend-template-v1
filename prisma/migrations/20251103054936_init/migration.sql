-- CreateTable
CREATE TABLE "audits" (
    "uuid" TEXT NOT NULL,
    "entity" TEXT,
    "method" TEXT,
    "userUuid" TEXT,
    "oldData" JSON,
    "newData" JSON,
    "url" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "file" (
    "uuid" TEXT NOT NULL,
    "filename" TEXT,
    "mimetype" TEXT,
    "path" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "file_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "logs" (
    "uuid" TEXT NOT NULL,
    "error" TEXT,
    "statusCode" INTEGER,
    "statusText" TEXT,
    "method" TEXT,
    "path" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("uuid")
);

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

-- CreateTable
CREATE TABLE "users" (
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "email" TEXT,
    "roleUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "audits_uuid_key" ON "audits"("uuid");

-- CreateIndex
CREATE INDEX "audits_entity_idx" ON "audits"("entity");

-- CreateIndex
CREATE INDEX "audits_userUuid_idx" ON "audits"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "logs_uuid_key" ON "logs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "roles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
