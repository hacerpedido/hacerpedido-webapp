// This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
// export GOOGLE_APPLICATION_CREDENTIALS=../../hacerpedido/hacer-pedido-ea59c946b381.json

import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShopsWithProducts } from "../queriesCustom.js";
import { listShops } from "../queries.js";
import { createProduct, deleteProduct, createShop } from "../mutations";
import slugify from "slugify";
import { sanitizeCategory } from "../src/categories";

const { google } = require("googleapis");

API.configure(awsconfig);

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets("v4");

async function import_shops() {
  console.log("IMPORT SHOPS FROM TYPEFORM");

  const shopsData = await API.graphql(
    graphqlOperation(listShops, { limit: 10000 })
  );

  // console.log(shopsData.data.listShops.items);

  let shops = shopsData.data.listShops.items;

  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "1jQIYS0E2A_qhxByXPNS0Ncg0SEDaqUx4VUDUvtnMdHo",
      range: "HacerPedido V2!A2:M",
    },
    (err, res) => {
      if (err) {
        console.error("The API returned an error.");
        throw err;
      }
      const rows = res.data.values;
      if (rows.length === 0) {
        console.log("No data found.");
      } else {
        for (const row of rows) {
          // console.log("------------------------------------------------------");
          // console.log(`${row}`);
          let shop = processShopRow(row, shops);
          if (shop !== undefined) {
            shops.push(shop);
          }
        }
      }
    }
  );
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

function toSlug(name, shops) {
  let slug = slugify(name, { remove: /[*+~.()'"!:@]/g, lower: true });
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
  const typeformToken = row[12];

  let shopExists =
    shops.find((o) => o.typeformToken === typeformToken) !== undefined;
  if (shopExists) {
    return;
  }

  let shop = {
    userName: row[0], // ¿Cómo es tu nombre?
    name: row[1], // ¿Cuál es el nombre de tu negocio?
    category: row[2], // 2 - ¿En qué categoría de estas entraría?
    region: row[3], // 3 - ¿En qué ciudad está ubicado?
    address: row[4], // 4 - ¿Cuál es la dirección de tu negocio?
    openTimes: row[5], // 5 - ¿Cuáles son tus horarios?
    ordersWhatsAppNumber: row[6], // 6 - ¿Con qué *WhatsApp* recibís pedidos de tus clientes?
    // const  = row[7]; // 7 - ¿Usás otro teléfono para tomar pedidos?
    ordersPhoneNumber: row[8], // 8 - Escribí tu otro teléfono:
    email: row[9], // 9 - ¿Cuál es tu e-mail?
    deliveryCost: row[10],
    submittedAt: row[11], // 11 - Submitted At
    typeformToken: typeformToken, // 12 - Token
    visibility: "private",
  };

  shop = removeEmptyStringElements(shop);

  shop.slug = toSlug(shop.name, shops);
  shop.category = sanitizeCategory(shop.category);

  // TODO: Usarlo por defecto, agregar el "9", sacar el "0" si hace falta "0223" > "223"

  console.log("add: " + shop.slug);
  console.log(shop);

  API.graphql(graphqlOperation(createShop, { input: shop })).catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });

  return shop;
}

async function import_products() {
  const spreadsheetId = "1BlSWW56-1--6kQ7sgygddsGiM9s4EBrYFTKFVnkTRys";
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
          processShopRows(sheet.properties.title, rows, shops);
        }
        // console.log("-----------------------------------");
      }
    );
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
}

// TODO: Crear biblioteca de funciones:

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
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

  console.log(slug);

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

    API.graphql(graphqlOperation(createProduct, { input: product })).catch(
      (error) => {
        console.log(JSON.stringify(error, null, 2));
      }
    );
  });
}

import_shops()
  .then(() => {
    import_products();
  })
  .catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });
