-- CreateTable
CREATE TABLE "RejectedBooking" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RejectedBooking_pkey" PRIMARY KEY ("id")
);
