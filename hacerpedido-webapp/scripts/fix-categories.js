import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { updateShop } from "../mutations";
import { sanitizeCategory } from "../src/categories";

API.configure(awsconfig);

async function fix_categories() {
  const shopsData = await API.graphql(
    graphqlOperation(listShops, { limit: 10000 })
  );

  const shops = shopsData.data.listShops.items;

  shops.forEach((shop) => {
    let category = sanitizeCategory(shop.category);

    if (category !== shop.category) {
      console.log(shop.slug + ": " + category + " <- " + shop.category);
      // } else {
      //   console.log("SKIP: " + shop.category);

      let newShopValues = {
        id: shop.id,
        category: category,
      };

      API.graphql({
        query: updateShop,
        variables: { input: newShopValues },
      }).catch((error) => {
        console.log(JSON.stringify(error, null, 2));
      });
    }
  });
}

fix_categories().catch((error) => {
  console.log(JSON.stringify(error, null, 2));
});
