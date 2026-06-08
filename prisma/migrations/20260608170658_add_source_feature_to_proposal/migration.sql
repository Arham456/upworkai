/*
  Warnings:

  - You are about to drop the `Audit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_userId_fkey";

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "sourceFeature" TEXT NOT NULL DEFAULT 'personalize';

-- DropTable
DROP TABLE "Audit";
