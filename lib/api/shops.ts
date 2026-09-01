import axios from "axios";
import type { Product, Shop } from "../types";

export interface ShopPatch extends Partial<Shop> {
  id: string | number;
}

export interface SaveShopResult {
  message: string;
  error?: number;
}

export async function saveShopWithProducts(
  token: string,
  shopPatch: ShopPatch,
  newProducts: Product[],
): Promise<SaveShopResult> {
  const params = {
    id: shopPatch.id,
    address: shopPatch.address,
    deliverycost: shopPatch.deliverycost,
    name: shopPatch.name,
    notes: shopPatch.notes,
    opentimes: shopPatch.opentimes,
    ordersphonenumber: shopPatch.ordersphonenumber,
    orderswhatsappnumber: shopPatch.orderswhatsappnumber,
    token: token,
    products: newProducts,
  };

  // console.log("saveShopWithProducts 2:", params);

  try {
    await axios.post(`${window.location.origin}/api/shop/by-token`, params);
  } catch (error: unknown) {
    const responseMessage =
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        : undefined;
    return {
      message: `Error al grabar los datos del comercio. (${String(error)} Error: ${responseMessage})`,
      error: 1,
    };
  }

  return {
    message: "Tus cambios fueron guardados.",
  };
}
