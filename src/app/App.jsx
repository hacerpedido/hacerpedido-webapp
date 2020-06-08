import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import Cart from "../features/Cart/Cart";
import Home from "../features/Home/Home";
import ShopPage from "../features/Shop/ShopPage";
import EditShopPage from "../features/EditShop/EditShopPage";

export default () => {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/cart" component={Cart} />
          <Route path={`/:slug/edit/:token`} component={EditShopPage} />
          <Route path={`/:slug`} component={ShopPage} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </>
  );
};
