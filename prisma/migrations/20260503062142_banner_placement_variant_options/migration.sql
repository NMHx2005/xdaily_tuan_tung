-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO', 'HOME_FOUR');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "placement" "BannerPlacement" NOT NULL DEFAULT 'HERO';

-- AlterTable
ALTER TABLE "BlogPost" ALTER COLUMN "author" SET DEFAULT 'TuAnh';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "variantOptionGroups" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE INDEX "Banner_placement_position_idx" ON "Banner"("placement", "position");
