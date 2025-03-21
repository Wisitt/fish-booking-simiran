/*
  Warnings:

  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "approvedPrice" DECIMAL(65,30),
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logPrices" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'รออนุมัติ',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
