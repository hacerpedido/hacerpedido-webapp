/*
  Warnings:

  - Made the column `category` on table `shops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable

ALTER TABLE shops DISABLE TRIGGER ALL;
UPDATE shops SET category='Otros' where category IS NULL;
ALTER TABLE "shops" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE shops ENABLE TRIGGER ALL;
