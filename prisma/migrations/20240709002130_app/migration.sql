/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Item";

-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "logo" TEXT,
    "image" TEXT,
    "cost" TEXT,
    "download" TEXT,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);
