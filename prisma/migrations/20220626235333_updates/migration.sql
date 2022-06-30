-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_shopid_fkey";

-- AlterTable
ALTER TABLE "products" RENAME CONSTRAINT "id_products" TO "products_pkey";

-- AlterTable
ALTER TABLE "shops" RENAME CONSTRAINT "id_shops" TO "shops_pkey";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopid_fkey" FOREIGN KEY ("shopid") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
