-- AlterTable
ALTER TABLE "Collection" ADD COLUMN "showOnHomeCategoryStrip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Collection" ADD COLUMN "homeStripPosition" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Collection" ADD COLUMN "homeStripLabel" TEXT NOT NULL DEFAULT '';
