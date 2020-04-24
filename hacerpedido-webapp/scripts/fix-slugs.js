import API, { graphqlOperation } from "@aws-amplify/api";
import awsconfig from "../src/aws-exports.js";
import { listShops } from "../queries.js";

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

  console.log(
    shops
      .filter((e) => lookup[e.slug])
      .map((s) => s.slug + " " + s.typeformToken + " " + s.visibility)
      .sort()
  );
}

fix_slugs().catch((error) => {
  console.log(JSON.stringify(error, null, 2));
});
