import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";

import Home from "./Home";
import Shop from "./Shop";

import awsconfig from "./aws-exports";

API.configure(awsconfig);
PubSub.configure(awsconfig);

export default () => {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route path={`/:slug`} component={Shop} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </React.Fragment>
  );
}
