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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "logs_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "logs_uuid_key" ON "logs"("uuid");
