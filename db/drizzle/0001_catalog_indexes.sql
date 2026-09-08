CREATE INDEX "idx_products_shopid_itemnumber" ON "products" USING btree ("shopid","itemnumber");--> statement-breakpoint
CREATE INDEX "idx_shops_public_category_updated_at" ON "shops" USING btree ("category","updated_at" DESC NULLS FIRST) WHERE "shops"."visibility" = 'public';--> statement-breakpoint
CREATE INDEX "idx_shops_typeformtoken" ON "shops" USING btree ("typeformtoken");