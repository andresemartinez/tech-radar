-- CreateTable
CREATE TABLE "TechInterest" (
    "id" TEXT NOT NULL,
    "creationDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdateDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technologyId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,

    CONSTRAINT "TechInterest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TechInterest" ADD CONSTRAINT "TechInterest_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechInterest" ADD CONSTRAINT "TechInterest_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
