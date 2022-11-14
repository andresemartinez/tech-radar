-- CreateEnum
CREATE TYPE "TechRadarAxisType" AS ENUM ('professional', 'company', 'technology', 'category');

-- CreateTable
CREATE TABLE "TechRadar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "angularAxis" "TechRadarAxisType" NOT NULL,
    "radialAxis" "TechRadarAxisType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TechRadar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfessionalToTechRadar" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TechRadarToTechnology" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TechRadarToTechnologyCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProfessionalToTechRadar_AB_unique" ON "_ProfessionalToTechRadar"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfessionalToTechRadar_B_index" ON "_ProfessionalToTechRadar"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TechRadarToTechnology_AB_unique" ON "_TechRadarToTechnology"("A", "B");

-- CreateIndex
CREATE INDEX "_TechRadarToTechnology_B_index" ON "_TechRadarToTechnology"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TechRadarToTechnologyCategory_AB_unique" ON "_TechRadarToTechnologyCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TechRadarToTechnologyCategory_B_index" ON "_TechRadarToTechnologyCategory"("B");

-- AddForeignKey
ALTER TABLE "TechRadar" ADD CONSTRAINT "TechRadar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessionalToTechRadar" ADD CONSTRAINT "_ProfessionalToTechRadar_A_fkey" FOREIGN KEY ("A") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessionalToTechRadar" ADD CONSTRAINT "_ProfessionalToTechRadar_B_fkey" FOREIGN KEY ("B") REFERENCES "TechRadar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechRadarToTechnology" ADD CONSTRAINT "_TechRadarToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES "TechRadar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechRadarToTechnology" ADD CONSTRAINT "_TechRadarToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechRadarToTechnologyCategory" ADD CONSTRAINT "_TechRadarToTechnologyCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "TechRadar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechRadarToTechnologyCategory" ADD CONSTRAINT "_TechRadarToTechnologyCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TechnologyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
