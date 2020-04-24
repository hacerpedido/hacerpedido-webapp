import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { updateShop } from "../mutations";
// import categories from "../src/categories";

// TODO: Importarlas en vez de usarlas acá
// Hay que hacer que la importación no trate
// de procesar React y otras cosas que no necesitamos
const categories = [
  "Comida",
  "Cervecerías",
  "Helados y Postres",
  "Panadería",
  "Saludable", // Productos saludables
  "Almacén / Kiosko", // Kiosko, almacén, minimercado
  "Cafetería",
  "Bebidas", // Bebidas alcohólicas
  "Otros", // Otro
];

API.configure(awsconfig);

async function fix_categories() {
  const shopsData = await API.graphql(
    graphqlOperation(listShops, { limit: 10000 })
  );

  const shops = shopsData.data.listShops.items;

  shops.forEach((shop) => {
    let category = fix_category(shop.category);

    if (category !== shop.category) {
      console.log(shop.slug + ": " + category + " <- " + shop.category);
      // } else {
      //   console.log("SKIP: " + shop.category);

      let newShopValues = {
        id: shop.id,
        category: category,
      };

      updateShopApi(newShopValues).catch((error) => {
        console.log(JSON.stringify(error, null, 2));
      });
    }
  });
}

function fix_category(oldCategory) {
  if (categories.includes(oldCategory)) {
    return oldCategory;
  }

  let category = oldCategory;

  switch (oldCategory) {
    case "Bebida":
      return "Bebida";
    // TODO: return "Bebidas";

    case "Bebidas alcoholicas":
      return "Bebidas";

    case "Bebidas alcohólicas":
      return "Bebidas";

    case "Cafeteria":
      return "Cafeteria";
    // TODO: return "Cafetería";

    case "Farmacia":
      return "Otros";

    case "Kiosco, almacén, minimercado":
      return "Almacén / Kiosko";

    case "Kiosco/almacen":
      return "Almacén / Kiosko";

    case "Minimercado/supermercado":
      return "Almacén / Kiosko";

    case "Otros (alimento para mascotas, tecnología, productos congelados, viandas)":
      return "Otros";

    case "Restaurante":
      return "Comida";

    case "Verdulería y frutería":
      return "Comida";

    default:
      console.log("ERROR: " + category + " no está considerada.");
      break;
  }

  return category;
}

async function updateShopApi(shop) {
  await API.graphql({
    query: updateShop,
    variables: { input: shop },
  });
}

fix_categories().catch((error) => {
  console.log(JSON.stringify(error, null, 2));
});
