/*
  Warnings:

  - You are about to drop the column `email` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Professional` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Professional` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Professional` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Professional_email_key";

-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");

-- CreateIndex
CREATE INDEX "Professional_userId_idx" ON "Professional"("userId");
