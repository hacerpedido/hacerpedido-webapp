import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";
import Home from "./Home";
import Header from "./Header";
import Store from "./Shop";
import Admin from "./Admin";
import AdminShopsImport from './AdminShopsImport';

// import { createStore } from './graphql/mutations';
import awsconfig from "./aws-exports";

// Configure Amplify
API.configure(awsconfig);
PubSub.configure(awsconfig);

// async function createNewStore() {
//   const random =  Math.random().toString(36).substring(2, 15);
//   const todo = { name: "Store de prueba - " + random };
//   await API.graphql(graphqlOperation(createStore, { input: todo }));
// }

export default function App() {
  return (
    <Router>
      <div>
        <Header />

        {/* <button onClick={createNewStore}>Add Store</button> */}

        <Switch>
          <Route path="/admin/shops-import">
            <AdminShopsImport />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/start">
            <div>Página para comercios</div>
          </Route>
          <Route path={`/:storeId`}>
            <Store />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
