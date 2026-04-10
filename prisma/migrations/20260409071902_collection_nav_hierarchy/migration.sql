-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "navIcon" TEXT NOT NULL DEFAULT 'Package',
ADD COLUMN     "navLabel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "showInStorefrontNav" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Collection_parentId_idx" ON "Collection"("parentId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
