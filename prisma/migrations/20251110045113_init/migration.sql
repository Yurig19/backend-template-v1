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
CREATE TABLE "emailTemplates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "variables" TEXT[],
    "category" VARCHAR(100),
    "description" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emailTemplates_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "errorLogs" (
    "uuid" TEXT NOT NULL,
    "error" TEXT,
    "statusCode" INTEGER,
    "statusText" TEXT,
    "method" TEXT,
    "path" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "errorLogs_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "file" (
    "uuid" TEXT NOT NULL,
    "filename" TEXT,
    "mimetype" TEXT,
    "key" VARCHAR(255),
    "path" TEXT,
    "size" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "storage" VARCHAR(50),
    "userUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "file_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "audits_uuid_key" ON "audits"("uuid");

-- CreateIndex
CREATE INDEX "audits_entity_idx" ON "audits"("entity");

-- CreateIndex
CREATE INDEX "audits_userUuid_idx" ON "audits"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "emailTemplates_name_key" ON "emailTemplates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uuid_key" ON "roles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "roles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "errorLogs_uuid_key" ON "errorLogs"("uuid");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleUuid_fkey" FOREIGN KEY ("roleUuid") REFERENCES "roles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
