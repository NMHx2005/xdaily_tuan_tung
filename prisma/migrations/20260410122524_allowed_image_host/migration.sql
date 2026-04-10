-- CreateTable
CREATE TABLE "AllowedImageHost" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowedImageHost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedImageHost_hostname_key" ON "AllowedImageHost"("hostname");

-- CreateIndex
CREATE INDEX "AllowedImageHost_hostname_idx" ON "AllowedImageHost"("hostname");
