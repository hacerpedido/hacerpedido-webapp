import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import history from "../history"
import Cart from "features/Cart/Cart";
import Home from "features/Home/Home";
import ShopPage from "features/Shop/ShopPage";
import EditShopPage from "features/EditShop/EditShopPage";
import WindowDimensionsProvider from "components/WindowDimensionsProvider";

export default () => {
  return (
    <React.StrictMode>
      <WindowDimensionsProvider>
        <Router history={history}>
          <Switch>
            <Route exact path="/cart" component={Cart} />
            <Route path={`/:token/edit`} component={EditShopPage} />
            <Route path={`/:slug`} component={ShopPage} />
            <Route exact path="/" component={Home} />
          </Switch>
        </Router>
      </WindowDimensionsProvider>
    </React.StrictMode>
  );
};
