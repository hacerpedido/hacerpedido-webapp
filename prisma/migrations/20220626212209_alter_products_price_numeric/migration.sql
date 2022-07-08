/*
  Warnings:

  - The `price` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE products DISABLE TRIGGER ALL;
UPDATE products SET price=NULL where price='';
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(65,30) USING translate(price, ',', '.')::decimal;
ALTER TABLE products ENABLE TRIGGER ALL;
