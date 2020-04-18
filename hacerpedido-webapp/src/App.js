import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";

import Home from "./Home";
import Shop from "./Shop";
import AdminApp from "./Admin/AdminHome";

import awsconfig from "./aws-exports";

API.configure(awsconfig);
PubSub.configure(awsconfig);

export default function App() {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route path="/admin/" component={AdminApp} />
          <Route path={`/:slug`} component={Shop} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </React.Fragment>
  );
}
