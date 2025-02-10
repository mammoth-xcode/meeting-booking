/*
  Warnings:

  - You are about to drop the column `image` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `image_name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id");

-- AlterTable
ALTER TABLE "Department" ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id");

-- AlterTable
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY ("equipment_id");

-- AlterTable
ALTER TABLE "Position" ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("position_id");

-- AlterTable
ALTER TABLE "Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id");

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "image",
ADD COLUMN     "image_name" TEXT NOT NULL,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id");

-- AlterTable
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_pkey" PRIMARY KEY ("roomtype_id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role_id" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("position_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomtype_id_fkey" FOREIGN KEY ("roomtype_id") REFERENCES "RoomType"("roomtype_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("equipment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
