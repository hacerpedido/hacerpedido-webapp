// npx babel --presets es2015 -d build-scripts/ src/graphql scripts/get-products.js src/aws-exports.js && node build-scripts/scripts/get-products.js

import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShopsWithProducts } from "../queriesCustom.js";
import { createProduct, deleteProduct, updateShop } from "../mutations";

const { google } = require("googleapis");

API.configure(awsconfig);

async function main() {
  // This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
  // export GOOGLE_APPLICATION_CREDENTIALS=../../hacerpedido/hacer-pedido-ea59c946b381.json
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const spreadsheetId = "1BlSWW56-1--6kQ7sgygddsGiM9s4EBrYFTKFVnkTRys";

  const sheets = google.sheets("v4");

  const shopsData = await API.graphql(
    graphqlOperation(listShopsWithProducts, {
      limit: 10000,
    })
  );
  const shops = shopsData.data.listShops.items;

  const request = {
    auth: auth,
    spreadsheetId: spreadsheetId,
    ranges: [],
    includeGridData: false,
  };

  const response = await sheets.spreadsheets.get(request);

  response.data.sheets.forEach(function (sheet) {
    const title = sheet.properties.title;

    sheets.spreadsheets.values.get(
      {
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: title + "!A2:G",
      },
      (err, res) => {
        // console.log("--------------------  " + sheet.properties.title);
        // console.log(sheet.properties.title);

        if (err) {
          console.error("The API returned an error.");
          throw err;
        }

        // console.log(JSON.stringify(res, null, 2));
        const rows = res.data.values;
        if (rows.length === 0) {
          console.log("No data found.");
        } else {
          processRows(sheet.properties.title, rows, shops);
        }
        // console.log("-----------------------------------");
      }
    );
  });
}

async function updateShopApi(shop) {
  await sleep(507 + Math.random() * 100);
  // await API.graphql(graphqlOperation(updateShop, { input: shop }));
  await API.graphql({
    query: updateShop,
    variables: { input: shop },
  });
}

async function deleteProducts(shop) {
  if (shop.products.items.length === 0) {
    console.log("No products to delete.");

    return;
  }
  await sleep(1000 + Math.random() * 100);
  shop.products.items.forEach((product) => {
    // console.log("DELETING: " + shop.id + "  -   " + product.id);
    API.graphql(
      graphqlOperation(deleteProduct, { input: { id: product.id } })
    ).catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  });
  // console.log("CONTINUE...");
}

// TODO: Crear biblioteca de funciones:

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function removeEmptyStringElements(obj) {
  for (var prop in obj) {
    if (typeof obj[prop] === "object") {
      removeEmptyStringElements(obj[prop]);
    } else if (obj[prop] === "") {
      delete obj[prop];
    }
  }
  return obj;
}

async function createProductApi(product) {
  await API.graphql(graphqlOperation(createProduct, { input: product }));
}

function processRows(slug, rows, shops) {
  // 0 - Título
  // 1 - Precio
  // 2 - Descripción
  // 3 - Promo
  // 4 - Categoria

  // type Product @model @key(name: "byShop", fields: ["shopID"]) {
  //     id: String!
  //     shopID: String!
  //     shop: Shop @connection(fields: ["shopID"])
  //     section: String!
  //     name: String!
  //     description: String
  //     price: Float
  //     onSale: Boolean!
  //    }

  if (
    slug.startsWith("NO") ||
    slug.startsWith("REVISAR") ||
    slug.startsWith("Sheet")
  ) {
    // console.log("SKIP: Sheet " + slug);
    console.log("--------------------  " + slug);

    return;
  }

  let shop = shops.find((o) => o.slug === slug);

    console.log(slug);

  if (shop === undefined) {
    console.log("ERROR: Shop not found");

    return;
  }

  let shopID = shop.id;

  // console.log("shopID: " + shopID);

  // console.log("Dirección: " + rows[0][6]);
  // console.log("Horario: " + rows[1][6]);
  // console.log("Envío a domicilio: " + rows[2][6]);
  // console.log("Logo: " + rows[3][6]);
  // console.log("Fondo: " + rows[4][6]);
  // console.log("Visibility: " + rows[5][6]);
  // console.log("ordersPhoneNumber: " + rows[6][6]);
  // console.log("whatsAppNumber: " + rows[7][6]);
  // console.log("region: " + rows[8][6]);
  // console.log("category: " + rows[9][6]);

  let newShopValues = {
    id: shopID,
    address: rows[0][6],
    openTimes: rows[1][6],
    deliveryCost: rows[2][6],
    logo: rows[3][6],
    background: rows[4][6],
    visibility: rows[5][6],
    ordersPhoneNumber: rows[6][6],
    ordersWhatsAppNumber: rows[7][6],
    region: rows[8][6],
    category: rows[9][6],
    notes: rows[10][6]
  };

  let shopValues = removeEmptyStringElements(newShopValues);

  updateShopApi(shopValues).catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });

  deleteProducts(shop).catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });

  var section = "";

  var itemNumber = 0;

  rows.forEach((row) => {
    const name = row[0];
    const price = row[1];
    const description = row[2];
    const isSection = row[4];

    if (name === "" || name === undefined) {
      //   console.log("-----> EMPTY");
      return;
    }

    // console.log(`${row}`);

    // Is a section?
    if (isSection !== undefined && isSection.toUpperCase() === "SI") {
      // console.log("-----> SECTION");
      section = name;

      return;
    }

    itemNumber++;

    let product = {
      name: name,
      price: parseFloat(price),
      category: section,
      productShopId: shopID,
      itemNumber: itemNumber,
    };

    if (description !== undefined && description !== "") {
      product.description = description;
    }

    // console.log(JSON.stringify(product, null, 2));

    // product = removeEmptyStringElements(product); Soy un optimista!

    createProductApi(product).catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  });
}

main().catch((error) => {
  console.log(JSON.stringify(error, null, 2));
});
