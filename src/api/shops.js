import axios from "axios";

import { updateShop } from "../graphql/shop.js";
import { HPGraphqlClient } from "./index";

export async function getShopWithProductsByToken(token) {
  let productFields = "id,category,name,price,description,itemnumber,updated_at";
  let shopFields =
    "id,name,slug,region,category,address,notes,opentimes,deliverycost,visibility,logo,background,ordersphonenumber,orderswhatsappnumber,typeformtoken,updated_at";
  let url = `/shops?typeformtoken=eq.${token}&select=${shopFields},products(${productFields})&products.order=itemnumber`;

  return axios.get(url);
}

export async function saveShopWithProducts(shopPatch, newProducts) {
  // console.log("saveShopWithProducts:", shopPatch);

  // Save Shop
  try {
    await HPGraphqlClient.mutate({
      variables: { input: { id: shopPatch.id, shopPatch } },
      mutation: updateShop,
    });
  } catch (error) {
    return {
      message: `Error al grabar los datos del comercio. (${error} Error: ${error.response.data.message})`,
      error: 1,
    };
  }

  if (newProducts == null) {
    return {
      message: "Tus cambios fueron guardados.",
    };
  }

  // Delete old Products
  try {
    await axios.delete(`/products?shopid=eq.${shopPatch.id}`);
  } catch (error) {
    return {
      message: `Error al grabar los datos. (${error} Error: ${error.response.data.message})`,
      error: 1,
    };
  }

  // Insert new Products
  try {
    await createProducts(shopPatch.id, newProducts);
  } catch (error) {
    return {
      message: `Error al grabar los datos. (${error} Error: ${error.response.data.message})`,
      error: 1,
    };
  }

  return {
    message: "Tus cambios fueron guardados.",
  };
}

async function createProducts(shopid, newProducts) {
  if (shopid == null || shopid === "") {
    console.log("ERROR: createProducts, shopid is null or empty");

    return;
  }

  if (!Array.isArray(newProducts) || newProducts.length === 0) {
    console.log("ERROR: createProducts, no new products");

    return;
  }

  const productsToInsert = [];
  var itemnumber = 0;

  newProducts.forEach((product) => {
    let { name, description, price, category } = product;

    if (name == null || name === "") {
      return;
    }

    itemnumber++;

    let newProduct = {
      name,
      price: price ?? "",
      category: category ?? "",
      itemnumber,
      shopid,
      description: description ?? "",
    };

    productsToInsert.push(newProduct);
  });

  // console.log("createProducts:", productsToInsert);

  return axios.post("/products", productsToInsert);
}
