-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "prices" JSONB NOT NULL DEFAULT '[]';
