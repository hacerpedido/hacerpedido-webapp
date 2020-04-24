import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";
import { updateShop } from "../mutations";

API.configure(awsconfig);

async function fix_slugs() {
  const shopsData = await API.graphql(
    graphqlOperation(listShops, { limit: 10000 })
  );

  const shops = shopsData.data.listShops.items;

  const lookup = shops.reduce((a, e) => {
    a[e.slug] = ++a[e.slug] || 0;
    return a;
  }, {});

  console.log(shops.filter((e) => lookup[e.slug]).map(s => s.slug + " " +  s.typeformToken + " " + s.visibility).sort());

  // shops.forEach((shop) => {

  // let category = fix_category(shop.category);

  // if (category !== shop.category) {
  //   console.log(shop.slug + ": " + category + " <- " + shop.category);
  //   // } else {
  //   //   console.log("SKIP: " + shop.category);

  //   let newShopValues = {
  //     id: shop.id,
  //     category: category,
  //   };

  //   updateShopApi(newShopValues).catch((error) => {
  //     console.log(JSON.stringify(error, null, 2));
  //   });
  // }
  // });
}

async function updateShopApi(shop) {
  await API.graphql({
    query: updateShop,
    variables: { input: shop },
  });
}

fix_slugs().catch((error) => {
  console.log(JSON.stringify(error, null, 2));
});
