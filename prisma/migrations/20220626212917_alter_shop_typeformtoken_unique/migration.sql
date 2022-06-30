/*
  Warnings:

  - A unique constraint covering the columns `[typeformtoken]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shops_typeformtoken_key" ON "shops"("typeformtoken");
