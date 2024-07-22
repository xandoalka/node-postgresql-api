-- CreateEnum
CREATE TYPE "Type" AS ENUM ('website', 'app', 'fun');

-- CreateTable
CREATE TABLE "dataProject" (
    "id" SERIAL NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'website',
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "target" TEXT NOT NULL,

    CONSTRAINT "dataProject_pkey" PRIMARY KEY ("id")
);
