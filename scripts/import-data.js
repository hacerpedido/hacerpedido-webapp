// This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
// export GOOGLE_APPLICATION_CREDENTIALS=../hacerpedido/hacer-pedido-ea59c946b381.json

import slugify from "slugify";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

import { sanitizeCategory } from "../src/categories";
import * as utils from "../src/utils";
import {
  listAllShopsWithProducts,
  createProduct,
  createShop,
  deleteProductById,
} from "../shop.js";

const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets("v4");

const client = new ApolloClient({
  uri: "http://backend-restapi.hacerpedido.com/graphql",
  fetch: fetch,
});

async function import_shops() {
  console.log("IMPORT SHOPS FROM TYPEFORM");

  let shopsData = await client.query({
    query: listAllShopsWithProducts,
  });
  let shops = shopsData.data.allShops.nodes;

  // console.log(JSON.stringify(shops, null, 2));

  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "1jQIYS0E2A_qhxByXPNS0Ncg0SEDaqUx4VUDUvtnMdHo",
      range: "HacerPedido V2!A2:P",
    },
    (err, res) => {
      if (err) {
        console.error("The API returned an error.");
        throw err;
      }
      const rows = res.data.values;
      if (rows === undefined || rows.length === 0) {
        console.log("No data found.");
      } else {
        for (const row of rows) {
          // console.log("------------------------------------------------------");
          // console.log(`${row}`);
          let shop = processShopRow(row, shops);
          // console.log(`SHOP: ${shop}`);

          if (shop !== undefined) {
            shops.push(shop);
          }
        }
      }
    }
  );
}

function toSlug(name, shops) {
  let slug = slugify(name, { remove: /[*+~.()'"¡!:@]/g, lower: true });
  slug = slug.replace(/^-+|-+$/gm, ""); // quitar los - del principio y fin

  // if (slug.split("-").length >= 3) {
  //   slug = slug.replace(/-/g, ""); // quitar los -
  // }

  // Asegurarse que el slug es único antes de retornar

  if (shops.find((o) => o.slug === slug) === undefined) {
    return slug;
  }

  let isRepeated;
  let i = 0;
  do {
    let candidate = slug + "-" + ++i;
    isRepeated = shops.find((o) => o.slug === candidate) !== undefined;
  } while (isRepeated);

  return slug + "-" + i;
}

function processShopRow(row, shops) {
  const typeformToken = row[13];

  let shopExists =
    shops.find((o) => o.typeformtoken === typeformToken) !== undefined;
  if (shopExists) {
    // console.log(`SKIP: ${typeformToken}`);

    return;
  }

  let shop = {
    username: row[0], // ¿Cómo es tu nombre?
    name: row[1], // ¿Cuál es el nombre de tu negocio?
    category: row[2], // 2 - ¿En qué categoría de estas entraría?
    region: row[3], // 3 - ¿En qué ciudad está ubicado?
    address: row[4], // 4 - ¿Cuál es la dirección de tu negocio?
    opentimes: row[5], // 5 - ¿Cuáles son tus horarios?
    orderswhatsappnumber: row[6], // 6 - ¿Con qué *WhatsApp* recibís pedidos de tus clientes?
    // const  = row[7]; // 7 - ¿Usás otro teléfono para tomar pedidos?
    ordersphonenumber: row[8], // 8 - Escribí tu otro teléfono:
    email: row[9], // 9 - ¿Cuál es tu e-mail?
    deliverycost: row[10],
    // 11 - Otro teléfono
    submittedat: row[12], // 12 - Submitted At
    typeformtoken: typeformToken, // 13 - Token
    visibility: "private",
  };

  shop.slug = toSlug(shop.name, shops);
  shop.category = sanitizeCategory(shop.category);
  shop.address = utils.sanitizeAddress(shop.address);
  shop.orderswhatsappnumber = utils.sanitizeWhatsAppNumber(
    shop.orderswhatsappnumber
  );

  shop = utils.removeEmptyStringElements(shop);

  console.log("add: " + shop.slug);
  console.log(shop);

  client
    .mutate({
      variables: { input: { shop: shop } },
      mutation: createShop,
    })
    // .then((data) => {
    //   console.log(JSON.stringify(data, null, 2));
    // })
    .catch((error) => {
      console.log("ERROR: " + JSON.stringify(error, null, 2));
    });

  return shop;
}

async function import_products() {
  const spreadsheetId = "1BlSWW56-1--6kQ7sgygddsGiM9s4EBrYFTKFVnkTRys";

  let shopsData = await client.query({
    query: listAllShopsWithProducts,
  });
  let shops = shopsData.data.allShops.nodes;

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
          processShopRows(sheet.properties.title, rows, shops);
        }
        // console.log("-----------------------------------");
      }
    );
  });
}

async function deleteProducts(shop) {
  if (
    shop.productsByShopid === undefined ||
    shop.productsByShopid.nodes === undefined ||
    shop.productsByShopid.nodes.length === 0
  ) {
    console.log("No products to delete.");

    return;
  }
  shop.productsByShopid.nodes.forEach((product) => {
    // console.log("DELETING: " + shop.id + "  -   " + product.id);
    client
      .mutate({
        variables: { input: { id: product.id } },
        mutation: deleteProductById,
      })
      .catch((error) => {
        console.log("ERROR: " + JSON.stringify(error, null, 2));
      });
  });
}

function processShopRows(slug, rows, shops) {
  // 0 - Título
  // 1 - Precio
  // 2 - Descripción
  // 3 - Promo
  // 4 - Cate

  if (slug.startsWith("NO")) {
    // console.log("SKIP: Sheet " + slug);
    console.log("--------------------  " + slug);

    return;
  }

  let shop = shops.find((o) => o.slug === slug);

  console.log("https://hacerpedido.com/" + slug);

  if (shop === undefined) {
    console.log("ERROR: Shop not found");

    return;
  }

  let shopID = shop.id;

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
      return;
    }

    // Is a section?
    if (isSection !== undefined && isSection.toUpperCase() === "SI") {
      section = utils.toTitleCase(name);

      return;
    }

    itemNumber++;

    let product = {
      name: utils.sanitizeProductName(name),
      price: price ? utils.sanitizePrice(price).toString() : "",
      category: section,
      shopid: shopID,
      itemnumber: itemNumber,
    };

    if (description !== undefined && description !== "") {
      product.description = description;
    }

    // console.log(JSON.stringify(product, null, 2));

    client
      .mutate({
        variables: { input: { product: product } },
        mutation: createProduct,
      })
      .catch((error) => {
        console.log("ERROR: " + JSON.stringify(error, null, 2));
      });
  });
}

import_shops()
  .then(() => {
    import_products();
  })
  .catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });
