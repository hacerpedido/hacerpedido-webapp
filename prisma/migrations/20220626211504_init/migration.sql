CREATE SCHEMA IF NOT EXISTS extensions ;
ALTER SCHEMA extensions OWNER TO postgres;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT extensions.uuid_generate_v1(),
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "shopid" UUID NOT NULL,
    "itemnumber" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "id_products" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL DEFAULT extensions.uuid_generate_v1(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "username" TEXT,
    "category" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "ordersbyphoneorwhatsapp" TEXT,
    "delivery" TEXT,
    "takeaway" TEXT,
    "whatsappnumber" TEXT,
    "phonenumber" TEXT,
    "email" TEXT,
    "submittedat" TEXT,
    "opentimes" TEXT,
    "deliverycost" TEXT,
    "visibility" TEXT,
    "logo" TEXT,
    "background" TEXT,
    "typeformtoken" TEXT,
    "ordersphonenumber" TEXT,
    "orderswhatsappnumber" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "id_shops" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopid_fkey" FOREIGN KEY ("shopid") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
