import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const HPGraphqlClient = new ApolloClient({
  uri: "https://backend-restapi.hacerpedido.com/graphql",
  fetch: fetch,
});
