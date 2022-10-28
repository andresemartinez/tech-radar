-- DropIndex
DROP INDEX "TechSkill_levelId_technologyId_professionalId_key";

-- AlterTable
ALTER TABLE "TechSkill" ADD COLUMN     "current" BOOLEAN NOT NULL DEFAULT true;
