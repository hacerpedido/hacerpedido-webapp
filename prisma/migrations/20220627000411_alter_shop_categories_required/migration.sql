/*
  Warnings:

  - Made the column `category` on table `shops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shops" ALTER COLUMN "category" SET NOT NULL;
