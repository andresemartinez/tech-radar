/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Technology` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TechnologyCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TechnologyCategory_name_key" ON "TechnologyCategory"("name");
