import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { createShop } from "../mutations";
import { v4 as uuidv4 } from "uuid";

const { google } = require("googleapis");

API.configure(awsconfig);

async function main() {
  // This method looks for GOOGLE_APPLICATION_CREDENTIALS environment variable.
  // export GOOGLE_APPLICATION_CREDENTIALS=../../hacerpedido/hacer-pedido-ea59c946b381.json
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets("v4");
  const shopsData = await API.graphql(graphqlOperation(listShops, {limit: 10000}));

  // console.log(shopsData);
  // console.log(shopsData.data);
  // console.log(shopsData.data.listShops);
  // console.log(shopsData.data.listShops.items);

  const shops = shopsData.data.listShops.items;

  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "1Yw_wN07YVY2--GC3V-Sok94CKhqEKm-yHJp6YPZRopw",
      range: "HacerPedido.com!A2:J"
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
          //console.log(`${row}`);
          processRow(row, shops);
        }
      }
    }
  );
}

async function createShopApi(shop) {
  await API.graphql(graphqlOperation(createShop, { input: shop }));
}

function processRow(row, shops) {
  const name = row[0];
  const businessName = row[1];
  const category = row[2];
  const ordersByPhoneOrWhatsApp = row[3];
  const delivery = row[4];
  const whatsApp = row[5];
  const email = row[6];
  const takeaway = row[7];
  const submittedAt = row[8];
  const typeformToken = row[9];

  const tokenRegex = /^[a-z0-9]{32}$/;
  if (!tokenRegex.test(typeformToken)) {
    console.log("Invalid");

    return;
  }

  let obj = shops.find(o => o.typeformToken === typeformToken);

  if (obj === undefined) {
    console.log("add");
    const shop = {
      id: uuidv4(),
      name: businessName,
      slug: businessName,
      // region: null,
      typeformToken: typeformToken
    };
    createShopApi(shop).catch(console.error);
  } else {
    console.log("update");
  }
}

main().catch(console.error);

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
