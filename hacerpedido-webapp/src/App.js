import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";
// import { StyleSheet } from "react-native";
import {Helmet} from "react-helmet";

import Home from "./Home";
import Store from "./Shop";
// import Admin from "./Admin";
// import AdminShopsImport from "./AdminShopsImport";

import awsconfig from "./aws-exports";

API.configure(awsconfig);
PubSub.configure(awsconfig);

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     // flexDirection: 'column',
//     // backgroundColor: 'red',// '#fafcff',
//   }
// });

const HomeScreen = () => {
  return (
    <Router>
      <Switch>
        {/* <Route path="/admin/shops-import">
          <AdminShopsImport />
        </Route>
        <Route path="/admin">
          <Admin />
        </Route> */}
        <Route
          path="/start"
          component={() => {
            window.location.href = "https://hacerpedido.com/";
            return null;
          }}
        />
        <Route path={`/:slug`}>
          <Store />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
};

export default function App() {
  return (
    <React.Fragment>
      <HomeScreen />
    </React.Fragment>
  );
}
