-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "clientLocation" TEXT,
ADD COLUMN     "clientRating" TEXT,
ADD COLUMN     "connectsRequired" INTEGER,
ADD COLUMN     "hireRate" TEXT,
ADD COLUMN     "jobBudget" TEXT,
ADD COLUMN     "jobCategory" TEXT,
ADD COLUMN     "memberSince" TEXT,
ADD COLUMN     "proposalCount" TEXT,
ADD COLUMN     "totalSpent" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "voiceDNA" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "proposalsGenerated" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FearPattern" (
    "id" TEXT NOT NULL,
    "fearType" TEXT NOT NULL,
    "triggerWords" TEXT[],
    "jobCategory" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FearPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rejection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "rawFeedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobUrl" TEXT NOT NULL,
    "hireabilityScore" INTEGER NOT NULL,
    "auditFeedback" TEXT NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- AddForeignKey
ALTER TABLE "Rejection" ADD CONSTRAINT "Rejection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
