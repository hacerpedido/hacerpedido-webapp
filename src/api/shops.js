import {
  createProduct,
  deleteProductById,
  getShopByIdWithDetails,
  updateShop,
} from "../graphql/shop.js";
import { HPGraphqlClient } from "./index";

export function saveShopWithProducts(shopPatch, newProducts) {
  // console.log(
  //   "saveShopWithProducts: " +
  //     JSON.stringify({ shopPatch, newProducts }, null, 2)
  // );

  HPGraphqlClient.mutate({
    variables: { input: { id: shopPatch.id, shopPatch } },
    mutation: updateShop,
  })
    .then(() => {
      if (newProducts == null) {
        alert("Datos del comercio guardados. Sin cambios en los productos.");
      } else {
        deleteProducts(shopPatch.id).then(() => {
          createProducts(shopPatch.id, newProducts).then(() => {
            alert("Datos del comercio y los productos guardados.");
          });
        });
      }
    })
    .catch((error) => {
      console.log("ERROR: ", error);
    });
}

async function deleteProducts(shopid) {
  const shopData = await HPGraphqlClient.query({
    query: getShopByIdWithDetails,
    variables: { id: shopid },
  }).catch((error) => {
    console.log("ERROR: ", error);
  });

  let oldProducts = shopData?.data?.shopById?.productsByShopid?.nodes;

  if (oldProducts == null || oldProducts.length === 0) {
    return;
  }

  oldProducts.forEach(async (product) => {
    if (product.id == null) {
      return;
    }

    // console.log("DELETING: " + product.id);
    await HPGraphqlClient.mutate({
      variables: { input: { id: product.id } },
      mutation: deleteProductById,
    }).catch((error) => {
      console.log("ERROR: ", error);
    });
  });
}

async function createProducts(shopid, newProducts) {
  var itemNumber = 0;

  newProducts.forEach(async (product) => {
    let { name, description, price, category } = product;

    if (name == null || name === "") {
      return;
    }

    itemNumber++;

    let newProduct = { name, price, category, itemnumber: itemNumber, shopid };

    if (description != null && description !== "") {
      newProduct.description = description;
    }

    await HPGraphqlClient.mutate({
      variables: { input: { product: newProduct } },
      mutation: createProduct,
    }).catch((error) => {
      console.log("ERROR: " + JSON.stringify(error, null, 2));
    });
  });
}
