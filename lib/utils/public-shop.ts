type ShopRecord = Record<string, unknown>;

/** Remove editor-only fields before returning shop data from a public surface. */
export function serializePublicShop<T extends ShopRecord>(
  shop: T,
): Omit<T, "typeformtoken"> {
  const { typeformtoken: _typeformtoken, ...publicShop } = shop;

  return publicShop;
}

export function serializePublicShops<T extends ShopRecord>(
  shops: T[],
): Array<Omit<T, "typeformtoken">> {
  return shops.map(serializePublicShop);
}
