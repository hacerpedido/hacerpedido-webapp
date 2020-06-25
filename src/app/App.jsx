import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "../features/Home/Home";
import ShopPage from "../features/Shop/ShopPage";
import EditShopPage from "../features/EditShop/EditShopPage";
import WindowDimensionsProvider from "components/WindowDimensionsProvider";

export default () => {
  return (
    <>
      <WindowDimensionsProvider>
        <Router>
          <Switch>
            <Route path={`/:token/edit`} component={EditShopPage} />
            <Route path={`/:slug`} component={ShopPage} />
            <Route exact path="/" component={Home} />
          </Switch>
        </Router>
      </WindowDimensionsProvider>
    </>
  );
};
