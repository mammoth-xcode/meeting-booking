-- CreateEnum
CREATE TYPE "AccountVerification" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verification" "AccountVerification" NOT NULL DEFAULT 'UNVERIFIED';
