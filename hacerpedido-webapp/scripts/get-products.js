// npx babel --presets es2015 -d build-scripts/ src/graphql scripts/get-products.js src/aws-exports.js && node build-scripts/scripts/get-products.js

import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { createProduct } from "../mutations";

const { google } = require("googleapis");

API.configure(awsconfig);

async function main() {
  // This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
  // export GOOGLE_APPLICATION_CREDENTIALS=../../hacerpedido/hacer-pedido-ea59c946b381.json
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const spreadsheetId = "1BlSWW56-1--6kQ7sgygddsGiM9s4EBrYFTKFVnkTRys";

  const sheets = google.sheets("v4");

  const shopsData = await API.graphql(
    graphqlOperation(listShops, { limit: 10000 })
  );
  const shops = shopsData.data.listShops.items;

  const request = {
    auth: auth,
    spreadsheetId: spreadsheetId,
    ranges: [],
    includeGridData: false
  };

  const response = await sheets.spreadsheets.get(request);

  //   ).data;

  response.data.sheets.forEach(function(sheet) {
    const title = sheet.properties.title;

    sheets.spreadsheets.values.get(
      {
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: title + "!A2:E"
      },
      (err, res) => {
        console.log("-----------------------------------");
        console.log(sheet.properties.title);

        if (err) {
          console.error("The API returned an error.");
          throw err;
        }
        const rows = res.data.values;
        if (rows.length === 0) {
          console.log("No data found.");
        } else {
          processRows(sheet.properties.title, rows, shops);
        }
        console.log("-----------------------------------");
      }
    );
  });

  // console.log(JSON.stringify(responseSheets, null, 2));
}

// async function deleteProductsApi(shopID) {
//   await API.graphql(
//     graphqlOperation(deleteProduct, { condition: { shopID: { eq: shopID } } })
//   );

//   //   await API.graphql({
//   //     query: deleteProduct,
//   //     variables: { input: shop, condition: { shopID: { eq: shopID } }}
//   //   });
// }

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

  if (slug.startsWith("NO")) {
    console.log("SKIP: Sheet " + slug);

    return;
  }

  let shop = shops.find(o => o.slug === slug);

  //   console.log(shop);

  if (shop === undefined) {
    console.log("ERROR: Shop not found");

    return;
  }

  let shopID = shop.id;

  console.log("shopID: " + shopID);

  //   deleteProductsApi(shopID).catch(console.error);

  var section = "";

  for (const row of rows) {
    // console.log("-------");

    console.log(`${row}`);

    const name = row[0];
    const price = row[1];
    const description = row[2];
    // const onSale = row[3];
    const isSection = row[4];

    if (name === "" || name === undefined) {
      //   console.log("-----> EMPTY");
      continue;
    }

    // Is a section?
    if (isSection !== undefined && isSection.toUpperCase() === "SI") {
      console.log("-----> SECTION");
      section = name;

      continue;
    }

    let product = {
      // id: uuidv4(),
      name: name,
      price: price,
      category: section,
      // shopID: shopID,
      productShopId: shopID
    };

    if (description !== undefined && description !== "") {
      product["description"] = description;
    }

    // product = removeEmptyStringElements(product); Soy un optimista!

    createProductApi(product).catch(error => {
      console.log(JSON.stringify(error, null, 2));
    });
  }
}

main().catch(console.error);
