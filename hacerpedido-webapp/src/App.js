import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";

import Home from "./Home";
import Store from "./Shop";
// import Admin from "./Admin";

import awsconfig from "./aws-exports";

API.configure(awsconfig);
PubSub.configure(awsconfig);

export default function App() {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          {/* <Route path="/admin">
            <Admin />
          </Route> */}
          <Route path={`/:slug`}>
            <Store />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </React.Fragment>
  );
}
