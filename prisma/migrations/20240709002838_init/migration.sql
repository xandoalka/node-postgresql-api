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
