/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_code_key" ON "User"("code");
-- CreateIndex
INSERT INTO "User" ("email", "passwordHash", "role", "code", "createdAt", "updatedAt")
VALUES (
    'admin@example.com', -- อีเมลสำหรับ admin
    '$2a$10$XyIubZnV3.oZjLpzFzRJ2uI7z/HZB7JDXxkWQER/dKH9e8ekE1Pne', -- รหัสผ่าน "password" ที่ถูกแฮชด้วย bcrypt
    'admin', -- บทบาท admin
    'ADMIN-1', -- code (ตัวอย่าง)
    NOW(), -- วันที่สร้าง
    NOW()  -- วันที่อัปเดต
);
