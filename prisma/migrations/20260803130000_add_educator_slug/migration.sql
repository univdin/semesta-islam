-- AlterTable
ALTER TABLE "educator_profiles" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "educator_profiles_slug_key" ON "educator_profiles"("slug");
