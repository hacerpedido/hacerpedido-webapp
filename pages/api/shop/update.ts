// TODO: use next.js export default async function handler(req, res) {
import axios, { AxiosError } from "axios"

import type { Product, Shop } from "types"

export async function saveShopWithProducts(
  token: string,
  shop: Shop,
  newProducts: Product[]
) {
  const params = {
    id: shop.id,
    address: shop.address,
    deliverycost: shop.deliverycost,
    name: shop.name,
    notes: shop.notes,
    opentimes: shop.opentimes,
    ordersphonenumber: shop.ordersphonenumber,
    orderswhatsappnumber: shop.orderswhatsappnumber,
    token,
    products: newProducts,
  }

  try {
    await axios.post(`${window.location.origin}/api/shop/by-token`, params)
  } catch (err) {
    const errors = err as Error | AxiosError
    if (!axios.isAxiosError(errors)) {
      console.log(errors)
    }
  }

  //   return {
  //     message: `Error al grabar los datos del comercio. (${errors} Error: ${errors?.response?.data?.message})`,
  //     error: 1,
  //   }

  return {
    message: "Tus cambios fueron guardados.",
  }
}
