/*
  Warnings:

  - The `subscribe` column on the `App` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Subscribe" AS ENUM ('NO', 'YES');

-- AlterTable
ALTER TABLE "App" DROP COLUMN "subscribe",
ADD COLUMN     "subscribe" "Subscribe" NOT NULL DEFAULT 'NO';
