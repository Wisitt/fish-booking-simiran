/*
  Warnings:

  - Added the required column `customerGroup` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fishSize` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fishType` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekNumber` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `RejectedBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RejectedBooking" ADD COLUMN     "customerGroup" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "dailyQuantities" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "fishSize" TEXT NOT NULL,
ADD COLUMN     "fishType" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ถูกปฏิเสธ',
ADD COLUMN     "team" TEXT NOT NULL,
ADD COLUMN     "weekNumber" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE TEXT;
