/*
  Warnings:

  - You are about to drop the column `role_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role_id",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
