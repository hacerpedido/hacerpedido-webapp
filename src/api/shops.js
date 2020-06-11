import axios from "axios";

import { updateShop } from "../graphql/shop.js";
import { HPGraphqlClient } from "./index";

export async function saveShopWithProducts(shopPatch, newProducts) {
  // Save Shop
  try {
    await HPGraphqlClient.mutate({
      variables: { input: { id: shopPatch.id, shopPatch } },
      mutation: updateShop,
    });
  } catch (error) {
    alert(`Error al grabar los datos del comercio. (3: ${error})`);

    return;
  }

  if (newProducts == null) {
    alert("Datos del comercio guardados. Sin cambios en los productos.");

    return;
  }

  // Delete old Products
  try {
    await axios.delete(`/products?shopid=eq.${shopPatch.id}`);
  } catch (error) {
    alert(
      `Error al grabar los datos. (${error} Error: ${error.response.data.message})`
    );

    return;
  }

  // Insert new Products
  try {
    await createProducts(shopPatch.id, newProducts).then(() => {
      alert("Datos del comercio y los productos guardados.");
    });
  } catch (error) {
    alert(
      `Error al grabar los datos. (${error} Error: ${error.response.data.message})`
    );
  }
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

  console.log("createProducts:", productsToInsert);

  return axios.post("/products", productsToInsert);
}
