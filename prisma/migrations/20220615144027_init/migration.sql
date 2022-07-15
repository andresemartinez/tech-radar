-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "creationDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechSkill" (
    "id" TEXT NOT NULL,
    "creationDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdateDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "levelId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,

    CONSTRAINT "TechSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechSkillLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,

    CONSTRAINT "TechSkillLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnologyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TechnologyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TechnologyToTechnologyCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TechSkillLevel_name_key" ON "TechSkillLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TechnologyToTechnologyCategory_AB_unique" ON "_TechnologyToTechnologyCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TechnologyToTechnologyCategory_B_index" ON "_TechnologyToTechnologyCategory"("B");

-- AddForeignKey
ALTER TABLE "TechSkill" ADD CONSTRAINT "TechSkill_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechSkill" ADD CONSTRAINT "TechSkill_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "TechSkillLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechSkill" ADD CONSTRAINT "TechSkill_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechnologyToTechnologyCategory" ADD CONSTRAINT "_TechnologyToTechnologyCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechnologyToTechnologyCategory" ADD CONSTRAINT "_TechnologyToTechnologyCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TechnologyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
