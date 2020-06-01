import { updateShop } from "../graphql/shop.js";
import { HPGraphqlClient } from "./index";

export function saveShop(shop) {
  HPGraphqlClient.mutate({
    variables: { input: { id: shop.id, shopPatch: shop } },
    mutation: updateShop,
  })
  .then(() => {
      alert("Saved OK");
      })
    .catch((error) => {
      console.log("ERROR: ", error);
    });
}
