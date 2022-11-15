/*
  Warnings:

  - Changed the type of `angularAxis` on the `TechRadar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `radialAxis` on the `TechRadar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TechRadarAngularAxisType" AS ENUM ('technology', 'category');

-- CreateEnum
CREATE TYPE "TechRadarRadialAxisType" AS ENUM ('professional', 'company');

-- AlterTable
ALTER TABLE "TechRadar" DROP COLUMN "angularAxis",
ADD COLUMN     "angularAxis" "TechRadarAngularAxisType" NOT NULL,
DROP COLUMN "radialAxis",
ADD COLUMN     "radialAxis" "TechRadarRadialAxisType" NOT NULL;

-- DropEnum
DROP TYPE "TechRadarAxisType";
