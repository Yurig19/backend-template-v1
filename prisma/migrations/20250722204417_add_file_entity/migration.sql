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
