-- CreateTable
CREATE TABLE "Position" (
    "position_id" TEXT NOT NULL,
    "position_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "room_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "roomtype_id" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "location" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RoomType" (
    "roomtype_id" TEXT NOT NULL,
    "roomtype_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Equipment" (
    "equipment_id" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_date" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "stop_date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "stop_time" TEXT NOT NULL,
    "approve_status" TEXT NOT NULL,
    "remark" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_position_id_key" ON "Position"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_department_id_key" ON "Department"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_id_key" ON "Role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_room_id_key" ON "Room"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_roomtype_id_key" ON "RoomType"("roomtype_id");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_equipment_id_key" ON "Equipment"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_booking_id_key" ON "Booking"("booking_id");
