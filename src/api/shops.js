import ApolloClient from "apollo-boost";
// import { Alert } from "react-native";

import { updateShop } from "../graphql/shop.js";
import fetch from "node-fetch";

// TODO: Crearlo en un lugar común para todos los usos
const client = new ApolloClient({
  uri: "http://backend-restapi.hacerpedido.com/graphql",
  fetch: fetch,
});

// TODO: Remover el history!!!!!!!
export function saveShop(shop, history) {
  //   console.log("edit: " + JSON.stringify(shop, null, 2));

  client
    .mutate({
      variables: { input: { id: shop.id, shopPatch: shop } },
      mutation: updateShop,
    })
    .then(() => {
      alert("OK");
      //   console.log("SAVE OK!");
      //   history.push("/" + shop.slug + "/");
    })
    .catch((error) => {
      console.log("ERROR: " + JSON.stringify(error, null, 2));
    });

  //   return shop;
}
