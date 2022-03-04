import axios, { AxiosError } from "axios"

import type { Product } from "../../types"

export async function saveShopWithProducts(
  token: string,
  shopPatch: any,
  newProducts: Product[]
) {
  const params = {
    id: shopPatch.id,
    address: shopPatch.address,
    deliverycost: shopPatch.deliverycost,
    name: shopPatch.name,
    notes: shopPatch.notes,
    opentimes: shopPatch.opentimes,
    ordersphonenumber: shopPatch.ordersphonenumber,
    orderswhatsappnumber: shopPatch.orderswhatsappnumber,
    token,
    products: newProducts,
  }

  try {
    await axios.post(`${window.location.origin}/api/shop/by-token`, params)
  } catch (error: unknown | AxiosError) {
    return {
      message: `Error al grabar los datos del comercio. (${error} Error: ${error?.response?.data?.message})`,
      error: 1,
    }
  }

  return {
    message: "Tus cambios fueron guardados.",
  }
}
