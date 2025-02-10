/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "department_id" TEXT,
ADD COLUMN     "lastname" TEXT,
ADD COLUMN     "position_id" TEXT,
ADD COLUMN     "role_id" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "telephone" TEXT;
