-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "originalPrice" TEXT,
ADD COLUMN     "priceHistory" JSONB DEFAULT '[]',
ADD COLUMN     "year" INTEGER NOT NULL DEFAULT 0;
