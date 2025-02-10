/*
 Navicat Premium Dump SQL

 Source Server         : PostgreSQL_neon.tech_next_auth15
 Source Server Type    : PostgreSQL
 Source Server Version : 150010 (150010)
 Source Host           : ep-falling-bar-a5fo9kvo-pooler.us-east-2.aws.neon.tech:5432
 Source Catalog        : next_auth15
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 150010 (150010)
 File Encoding         : 65001

 Date: 10/02/2025 11:04:08
*/


-- ----------------------------
-- Type structure for UserRole
-- ----------------------------
DROP TYPE IF EXISTS "public"."UserRole";
CREATE TYPE "public"."UserRole" AS ENUM (
  'ADMIN',
  'USER',
  'MANAGER'
);
ALTER TYPE "public"."UserRole" OWNER TO "next_auth15_owner";

-- ----------------------------
-- Type structure for AccountVerification
-- ----------------------------
DROP TYPE IF EXISTS "public"."AccountVerification";
CREATE TYPE "public"."AccountVerification" AS ENUM (
  'VERIFIED',
  'UNVERIFIED'
);
ALTER TYPE "public"."AccountVerification" OWNER TO "next_auth15_owner";

-- ----------------------------
-- Sequence structure for User_employee_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."User_employee_id_seq";
CREATE SEQUENCE "public"."User_employee_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for Booking
-- ----------------------------
DROP TABLE IF EXISTS "public"."Booking";
CREATE TABLE "public"."Booking" (
  "booking_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "room_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" int4 NOT NULL,
  "booking_date" text COLLATE "pg_catalog"."default" NOT NULL,
  "topic" text COLLATE "pg_catalog"."default" NOT NULL,
  "start_date" text COLLATE "pg_catalog"."default" NOT NULL,
  "stop_date" text COLLATE "pg_catalog"."default" NOT NULL,
  "start_time" text COLLATE "pg_catalog"."default" NOT NULL,
  "stop_time" text COLLATE "pg_catalog"."default" NOT NULL,
  "approve_status" text COLLATE "pg_catalog"."default" NOT NULL,
  "remark" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of Booking
-- ----------------------------
INSERT INTO "public"."Booking" VALUES ('B003', 'R005', 1, '20250207', 'นโยบ้ายด้านการศึกษา ปี 2567', '20250207', '20250207', '080000', '163000', 'approved', 'ใช้เวลา 2 วัน');
INSERT INTO "public"."Booking" VALUES ('B006', 'R003', 1, '20250207', 'test', '20250207', '20250207', '130000', '173000', 'approved', '');
INSERT INTO "public"."Booking" VALUES ('B001', 'R001', 1, '20250205', 'test topic', '20250205', '20250205', '080000', '170000', 'approved', 'rm');
INSERT INTO "public"."Booking" VALUES ('B008', 'R003', 1, '20250209', 'การรับนักศึกษา 2568', '20250209', '20250209', '090000', '120000', 'approved', '');
INSERT INTO "public"."Booking" VALUES ('B007', 'R002', 1, '20250209', 'นโยบายการเงินการคลัง', '20250209', '20250209', '090000', '120000', 'approved', '');
INSERT INTO "public"."Booking" VALUES ('B002', 'R002', 1, '20250204', 'test 2', '20250205', '20250207', '080000', '160000', 'approved', 'rm2');
INSERT INTO "public"."Booking" VALUES ('B005', 'R005', 1, '20250207', 'xxx5', '20250207', '20250207', '070000', '080000', 'approved', '');
INSERT INTO "public"."Booking" VALUES ('B004', 'R005', 1, '20250207', 'ทดสอบการใช้ postgresql บน neontech', '20250210', '20250210', '083000', '170000', 'approved', 'test');

-- ----------------------------
-- Table structure for Department
-- ----------------------------
DROP TABLE IF EXISTS "public"."Department";
CREATE TABLE "public"."Department" (
  "department_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "department_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of Department
-- ----------------------------
INSERT INTO "public"."Department" VALUES ('DP03', 'บริหารสูงสุด');
INSERT INTO "public"."Department" VALUES ('DP01', 'ไม่ระบุ');
INSERT INTO "public"."Department" VALUES ('DP04', 'บริหารทั่วไป');
INSERT INTO "public"."Department" VALUES ('DP02', 'วิชาการ');

-- ----------------------------
-- Table structure for Equipment
-- ----------------------------
DROP TABLE IF EXISTS "public"."Equipment";
CREATE TABLE "public"."Equipment" (
  "equipment_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "equipment_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of Equipment
-- ----------------------------
INSERT INTO "public"."Equipment" VALUES ('EQ01', 'โปรเจ็คเตอร์ และอุปกรณ์ภายในอาคาร 1 ชุด');
INSERT INTO "public"."Equipment" VALUES ('EQ02', 'โปรเจ็คเตอร์ และอุปกรณ์ภายนอกอาคาร 1 ชุด');

-- ----------------------------
-- Table structure for Position
-- ----------------------------
DROP TABLE IF EXISTS "public"."Position";
CREATE TABLE "public"."Position" (
  "position_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "position_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of Position
-- ----------------------------
INSERT INTO "public"."Position" VALUES ('PS01', 'ไม่ระบุ');
INSERT INTO "public"."Position" VALUES ('PS02', 'ครู');
INSERT INTO "public"."Position" VALUES ('PS04', 'เจ้าหน้าที่ธุรการ');
INSERT INTO "public"."Position" VALUES ('PS03', 'ผู้บริหาร');

-- ----------------------------
-- Table structure for Role
-- ----------------------------
DROP TABLE IF EXISTS "public"."Role";
CREATE TABLE "public"."Role" (
  "role_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "role_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of Role
-- ----------------------------
INSERT INTO "public"."Role" VALUES ('ADMIN', 'ผู้ดูแลระบบ');
INSERT INTO "public"."Role" VALUES ('MANAGER', 'ผู้บริหาร');
INSERT INTO "public"."Role" VALUES ('USER', 'ผู้ใช้งานทั่วไป');

-- ----------------------------
-- Table structure for Room
-- ----------------------------
DROP TABLE IF EXISTS "public"."Room";
CREATE TABLE "public"."Room" (
  "room_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "room_name" text COLLATE "pg_catalog"."default" NOT NULL,
  "roomtype_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "capacity" text COLLATE "pg_catalog"."default",
  "equipment_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "image_name" text COLLATE "pg_catalog"."default",
  "location" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of Room
-- ----------------------------
INSERT INTO "public"."Room" VALUES ('R001', 'ห้องประชุมประกัน', 'RT01', '200', 'EQ01', 'R001.jpg', '');
INSERT INTO "public"."Room" VALUES ('R002', 'ห้องประชุม 2', 'RT02', '1000', 'EQ01', 'R002.jpg', '');
INSERT INTO "public"."Room" VALUES ('R003', 'ห้องประชุม 3', 'RT02', '500', 'EQ01', 'R003.jpg', '');
INSERT INTO "public"."Room" VALUES ('R004', 'โดมอเนกประสงค์', 'RT03', '2900', 'EQ02', 'dome001.jpg', '');
INSERT INTO "public"."Room" VALUES ('R005', 'ห้องประชุมนาคราช', 'RT03', '3000', 'EQ02', '', '');

-- ----------------------------
-- Table structure for RoomType
-- ----------------------------
DROP TABLE IF EXISTS "public"."RoomType";
CREATE TABLE "public"."RoomType" (
  "roomtype_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "roomtype_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of RoomType
-- ----------------------------
INSERT INTO "public"."RoomType" VALUES ('RT02', 'ห้องประชุมภายในอาคาร');
INSERT INTO "public"."RoomType" VALUES ('RT01', 'ห้องประชุมทั่วไป');
INSERT INTO "public"."RoomType" VALUES ('RT03', 'ห้องประชุมภายนอกอาคาร');

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS "public"."User";
CREATE TABLE "public"."User" (
  "employee_id" int4 NOT NULL DEFAULT nextval('"User_employee_id_seq"'::regclass),
  "name" text COLLATE "pg_catalog"."default",
  "lastname" text COLLATE "pg_catalog"."default",
  "position_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "department_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "telephone" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "username" text COLLATE "pg_catalog"."default" NOT NULL,
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "role" "public"."UserRole" NOT NULL DEFAULT 'USER'::"UserRole",
  "verification" "public"."AccountVerification" NOT NULL DEFAULT 'UNVERIFIED'::"AccountVerification"
)
;

-- ----------------------------
-- Records of User
-- ----------------------------
INSERT INTO "public"."User" VALUES (2, 'อภิรักษ์', 'ว่องไว', 'PS02', 'DP02', '', 'wongwaimammoth@gmail.com', 'wongwaimammoth', '$2b$10$z/1rcce9bpYhErTuRakL9ez24I6sBk4CIY4g.OMc6UTTsJXaTKFva', 'USER', 'VERIFIED');
INSERT INTO "public"."User" VALUES (1, 'apirak', 'wongwai', 'PS02', 'DP04', '', 'mammoth.xcode@gmail.com', 'mammoth', '$2b$10$ROTtmpwynLWJBELGKG7S2eQgZMj9XCZQkHqfpd094XWu2umzBQn9.', 'ADMIN', 'VERIFIED');

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."User_employee_id_seq"
OWNED BY "public"."User"."employee_id";
SELECT setval('"public"."User_employee_id_seq"', 2, true);

-- ----------------------------
-- Indexes structure for table Booking
-- ----------------------------
CREATE UNIQUE INDEX "Booking_booking_id_key" ON "public"."Booking" USING btree (
  "booking_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Booking
-- ----------------------------
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id");

-- ----------------------------
-- Indexes structure for table Department
-- ----------------------------
CREATE UNIQUE INDEX "Department_department_id_key" ON "public"."Department" USING btree (
  "department_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Department
-- ----------------------------
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id");

-- ----------------------------
-- Indexes structure for table Equipment
-- ----------------------------
CREATE UNIQUE INDEX "Equipment_equipment_id_key" ON "public"."Equipment" USING btree (
  "equipment_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Equipment
-- ----------------------------
ALTER TABLE "public"."Equipment" ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY ("equipment_id");

-- ----------------------------
-- Indexes structure for table Position
-- ----------------------------
CREATE UNIQUE INDEX "Position_position_id_key" ON "public"."Position" USING btree (
  "position_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Position
-- ----------------------------
ALTER TABLE "public"."Position" ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("position_id");

-- ----------------------------
-- Indexes structure for table Role
-- ----------------------------
CREATE UNIQUE INDEX "Role_role_id_key" ON "public"."Role" USING btree (
  "role_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Role
-- ----------------------------
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id");

-- ----------------------------
-- Indexes structure for table Room
-- ----------------------------
CREATE UNIQUE INDEX "Room_room_id_key" ON "public"."Room" USING btree (
  "room_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table Room
-- ----------------------------
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id");

-- ----------------------------
-- Indexes structure for table RoomType
-- ----------------------------
CREATE UNIQUE INDEX "RoomType_roomtype_id_key" ON "public"."RoomType" USING btree (
  "roomtype_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table RoomType
-- ----------------------------
ALTER TABLE "public"."RoomType" ADD CONSTRAINT "RoomType_pkey" PRIMARY KEY ("roomtype_id");

-- ----------------------------
-- Indexes structure for table User
-- ----------------------------
CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "User_username_key" ON "public"."User" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("employee_id");

-- ----------------------------
-- Foreign Keys structure for table Room
-- ----------------------------
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."Equipment" ("equipment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_roomtype_id_fkey" FOREIGN KEY ("roomtype_id") REFERENCES "public"."RoomType" ("roomtype_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table User
-- ----------------------------
ALTER TABLE "public"."User" ADD CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department" ("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."User" ADD CONSTRAINT "User_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."Position" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE;
