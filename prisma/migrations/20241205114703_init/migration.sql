-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "customerGroup" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "dailyQuantities" JSONB NOT NULL,
    "fishSize" TEXT NOT NULL,
    "fishType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
