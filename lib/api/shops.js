import axios from "axios";

export async function saveShopWithProducts(token, shopPatch, newProducts) {
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
  } catch (error) {
    return {
      message: `Error al grabar los datos del comercio. (${error} Error: ${error?.response?.data?.message})`,
      error: 1,
    };
  }

  return {
    message: "Tus cambios fueron guardados.",
  };
}
