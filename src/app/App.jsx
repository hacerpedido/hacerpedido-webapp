import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "../features/Home/Home";
import Shop from "../features/Shop/Shop";

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
};
