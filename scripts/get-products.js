// This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
// export GOOGLE_APPLICATION_CREDENTIALS=../../hacerpedido/hacer-pedido-ea59c946b381.json

import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
// import { listShopsWithProducts } from "../queriesCustom.js";
import { listShops } from "../queries.js";
import {
  // createProduct,
  // deleteProduct,
  // updateShop,
  createShop,
} from "../mutations";
import slugify from "slugify";

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

  const shops = shopsData.data.listShops.items;

  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "1Yw_wN07YVY2--GC3V-Sok94CKhqEKm-yHJp6YPZRopw",
      range: "HacerPedido.com!A2:J",
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

async function createShopApi(shop) {
  await API.graphql(graphqlOperation(createShop, { input: shop }));
}

// TODO: COPIADA DE import-data (este script tiene poca vida)
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

// async function updateShopApi(shop) {
//   // await API.graphql(graphqlOperation(updateShop, { input: shop }));
//   await API.graphql({
//     query: updateShop,
//     variables: { input: shop },
//   });
// }

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

function processShopRow(row, shops) {
  // 0 - Cómo es tu nombre?
  // 1 - Nombre del Negocio
  // 2 - ¿En qué categoría de estas entraría?
  // 3 - ¿Recibis pedidos por WhatsApp o por teléfono de tus clientes?
  // 4 - ¿Contás con delivery propio?
  // 5 - Whatsapp de Pedidos
  // 6 - Correo de contacto
  // 7 - ¿Contás con takeaway?
  // 8 - Submitted At
  // 9 - Token

  const userName = row[0];
  const businessName = row[1];
  const category = row[2]; // TODO: Convertir a una de las posibles en la base de datos
  const ordersByPhoneOrWhatsApp = row[3];
  const delivery = row[4];
  const whatsApp = row[5]; // TODO: Usarlo por defecto, agregar el "9", sacar el "0" si hace falta "0223" > "223"
  const email = row[6];
  const takeaway = row[7];
  const submittedAt = row[8];
  const typeformToken = row[9];

  let newValues = {
    name: businessName,
    typeformToken: typeformToken,
    userName: userName,
    ordersByPhoneOrWhatsApp: ordersByPhoneOrWhatsApp,
    delivery: delivery,
    whatsAppNumber: whatsApp,
    email: email,
    takeaway: takeaway,
    submittedAt: submittedAt,
  };

  let obj = shops.find((o) => o.typeformToken === typeformToken);

  let shop = {};
  if (obj !== undefined) {
    shop = Object.assign(obj, newValues);
    delete shop["products"];
  } else {
    shop = newValues;
  }

  shop = removeEmptyStringElements(shop);

  if (obj === undefined) {
    const slug = toSlug(newValues.name, shops);

    shop.visibility = "private";
    shop.region = "Mar del Plata";
    shop.slug = slug;
    shop.category = category;

    console.log("add: " + shop.slug);

    createShopApi(shop).catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
    // } else {
    //   const originalSlug = shop.slug;

    //   if (shop.slug === undefined) {
    //     shop.slug = toSlug(shop.name);
    //   } else {
    //     shop.slug = toSlug(shop.slug);
    //   }

    //   if (originalSlug !== shop.slug) {
    //     console.log("Update + SLUG:" + originalSlug + " ---> " + shop.slug);
    //   } else {
    //     console.log("update: " + shop.slug);
    //   }

    //   updateShopApi(shop).catch((error) => {
    //     console.log(JSON.stringify(error, null, 2));
    // });

    return shop;
  }
}

// async function import_products() {
//   const spreadsheetId = "1BlSWW56-1--6kQ7sgygddsGiM9s4EBrYFTKFVnkTRys";

//   const shopsData = await API.graphql(
//     graphqlOperation(listShopsWithProducts, {
//       limit: 10000,
//     })
//   );
//   const shops = shopsData.data.listShops.items;

//   const request = {
//     auth: auth,
//     spreadsheetId: spreadsheetId,
//     ranges: [],
//     includeGridData: false,
//   };

//   const response = await sheets.spreadsheets.get(request);

//   response.data.sheets.forEach(function (sheet) {
//     const title = sheet.properties.title;

//     sheets.spreadsheets.values.get(
//       {
//         auth: auth,
//         spreadsheetId: spreadsheetId,
//         range: title + "!A2:G",
//       },
//       (err, res) => {
//         // console.log("--------------------  " + sheet.properties.title);
//         // console.log(sheet.properties.title);

//         if (err) {
//           console.error("The API returned an error.");
//           throw err;
//         }

//         // console.log(JSON.stringify(res, null, 2));
//         const rows = res.data.values;
//         if (rows.length === 0) {
//           console.log("No data found.");
//         } else {
//           processShopRows(sheet.properties.title, rows, shops);
//         }
//         // console.log("-----------------------------------");
//       }
//     );
//   });
// }

// async function deleteProducts(shop) {
//   if (shop.products.items.length === 0) {
//     console.log("No products to delete.");

//     return;
//   }
//   await sleep(1000 + Math.random() * 100);
//   shop.products.items.forEach((product) => {
//     // console.log("DELETING: " + shop.id + "  -   " + product.id);
//     API.graphql(
//       graphqlOperation(deleteProduct, { input: { id: product.id } })
//     ).catch((error) => {
//       console.log(JSON.stringify(error, null, 2));
//     });
//   });
//   // console.log("CONTINUE...");
// }

// TODO: Crear biblioteca de funciones:

// function sleep(ms) {
//   // Usar: await sleep(1000);
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

// async function createProductApi(product) {
//   await API.graphql(graphqlOperation(createProduct, { input: product }));
// }

// function processShopRows(slug, rows, shops) {
//   // 0 - Título
//   // 1 - Precio
//   // 2 - Descripción
//   // 3 - Promo
//   // 4 - Cate

//   if (
//     slug.startsWith("NO") ||
//     slug.startsWith("REVISAR") ||
//     slug.startsWith("Sheet")
//   ) {
//     // console.log("SKIP: Sheet " + slug);
//     console.log("--------------------  " + slug);

//     return;
//   }

//   let shop = shops.find((o) => o.slug === slug);

//   console.log("https://hacerpedido.com/" + slug);

//   if (shop === undefined) {
//     console.log("ERROR: Shop not found");

//     return;
//   }

//   let shopID = shop.id;

//   // console.log("shopID: " + shopID);
//   // console.log("Dirección: " + rows[0][6]);
//   // console.log("Horario: " + rows[1][6]);
//   // console.log("Envío a domicilio: " + rows[2][6]);
//   // console.log("Logo: " + rows[3][6]);
//   // console.log("Fondo: " + rows[4][6]);
//   // console.log("Visibility: " + rows[5][6]);
//   // console.log("ordersPhoneNumber: " + rows[6][6]);
//   // console.log("whatsAppNumber: " + rows[7][6]);
//   // console.log("region: " + rows[8][6]);
//   // console.log("category: " + rows[9][6]);

//   // let newShopValues = {
//   //   id: shopID,
//   //   address: rows[0][6],
//   //   openTimes: rows[1][6],
//   //   deliveryCost: rows[2][6],
//   //   logo: rows[3][6],
//   //   background: rows[4][6],
//   //   visibility: rows[5][6],
//   //   ordersPhoneNumber: rows[6][6],
//   //   ordersWhatsAppNumber: rows[7][6],
//   //   region: rows[8][6],
//   //   category: rows[9][6],
//   // };

//   // if (rows.length > 9) {
//   //   newShopValues.notes = rows[10][6];
//   // }

//   // let shopValues = removeEmptyStringElements(newShopValues);

//   // updateShopApi(shopValues).catch((error) => {
//   //   console.log(JSON.stringify(error, null, 2));
//   // });

//   deleteProducts(shop).catch((error) => {
//     console.log(JSON.stringify(error, null, 2));
//   });

//   var section = "";

//   var itemNumber = 0;

//   rows.forEach((row) => {
//     const name = row[0];
//     const price = row[1];
//     const description = row[2];
//     const isSection = row[4];

//     if (name === "" || name === undefined) {
//       return;
//     }

//     // Is a section?
//     if (isSection !== undefined && isSection.toUpperCase() === "SI") {
//       section = name;

//       return;
//     }

//     itemNumber++;

//     let product = {
//       name: name,
//       price: parseFloat(price),
//       category: section,
//       productShopId: shopID,
//       itemNumber: itemNumber,
//     };

//     if (description !== undefined && description !== "") {
//       product.description = description;
//     }

//     // console.log(JSON.stringify(product, null, 2));

//     createProductApi(product).catch((error) => {
//       console.log(JSON.stringify(error, null, 2));
//     });
//   });
// }

import_shops()
  .then(() => {
    // console.log("IMPORT PRODUCTS");
    // import_products();
  })
  .catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });
