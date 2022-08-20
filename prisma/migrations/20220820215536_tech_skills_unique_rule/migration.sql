/*
  Warnings:

  - A unique constraint covering the columns `[levelId,technologyId,professionalId]` on the table `TechSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TechSkillLevel" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TechnologyCategory" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "TechSkill_levelId_technologyId_professionalId_key" ON "TechSkill"("levelId", "technologyId", "professionalId");
