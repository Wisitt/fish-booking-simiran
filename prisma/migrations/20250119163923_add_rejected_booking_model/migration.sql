/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `RejectedBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RejectedBooking_id_key" ON "RejectedBooking"("id");
