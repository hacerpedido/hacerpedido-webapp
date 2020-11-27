import axios from "axios";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";

export const HPGraphqlClient = new ApolloClient({
  uri: "https://backend-restapi.hacerpedido.com/graphql",
  fetch: fetch,
});

axios.defaults.baseURL = "https://backend-restapi.hacerpedido.com:5001";
axios.defaults.headers.common["Content-Type"] = "application/json";
