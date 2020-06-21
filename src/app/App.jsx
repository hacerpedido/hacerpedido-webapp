import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import Home from "../features/Home/Home";
import ShopPage from "../features/Shop/ShopPage";
import EditShopPage from "../features/EditShop/EditShopPage";

export default () => {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route path={`/:token/edit`} component={EditShopPage} />
          <Route path={`/:slug`} component={ShopPage} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </React.Fragment>
  );
};
