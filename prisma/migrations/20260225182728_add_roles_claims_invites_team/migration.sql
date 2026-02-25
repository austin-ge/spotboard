-- CreateEnum
CREATE TYPE "InviteRole" AS ENUM ('MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('OPERATOR', 'STAFF');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'STAFF';
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Dropzone" ADD COLUMN     "verifiedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "DropzoneManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropzoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropzoneManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropzoneStaff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropzoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropzoneStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropzoneInvite" (
    "id" TEXT NOT NULL,
    "dropzoneId" TEXT NOT NULL,
    "email" TEXT,
    "token" TEXT NOT NULL,
    "role" "InviteRole" NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DropzoneInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropzoneClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropzoneId" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "emailDomain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "DropzoneClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DropzoneManager_userId_dropzoneId_key" ON "DropzoneManager"("userId", "dropzoneId");

-- CreateIndex
CREATE UNIQUE INDEX "DropzoneStaff_userId_dropzoneId_key" ON "DropzoneStaff"("userId", "dropzoneId");

-- CreateIndex
CREATE UNIQUE INDEX "DropzoneInvite_token_key" ON "DropzoneInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "DropzoneClaim_userId_dropzoneId_key" ON "DropzoneClaim"("userId", "dropzoneId");

-- AddForeignKey
ALTER TABLE "DropzoneManager" ADD CONSTRAINT "DropzoneManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneManager" ADD CONSTRAINT "DropzoneManager_dropzoneId_fkey" FOREIGN KEY ("dropzoneId") REFERENCES "Dropzone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneStaff" ADD CONSTRAINT "DropzoneStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneStaff" ADD CONSTRAINT "DropzoneStaff_dropzoneId_fkey" FOREIGN KEY ("dropzoneId") REFERENCES "Dropzone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneInvite" ADD CONSTRAINT "DropzoneInvite_dropzoneId_fkey" FOREIGN KEY ("dropzoneId") REFERENCES "Dropzone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneClaim" ADD CONSTRAINT "DropzoneClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropzoneClaim" ADD CONSTRAINT "DropzoneClaim_dropzoneId_fkey" FOREIGN KEY ("dropzoneId") REFERENCES "Dropzone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
