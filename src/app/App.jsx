import React from "react";
import {useTransition, animated} from 'react-spring'
import {BrowserRouter as Router, Switch, Route, useLocation} from "react-router-dom";

import Cart from "../features/Cart/Cart";
import Home from "../features/Home/Home";
import ShopPage from "../features/Shop/ShopPage";
import EditShopPage from "../features/EditShop/EditShopPage";

export default () => {
  const AnimatedSwitch = () => {
    const location = useLocation()

    const transitions = useTransition(location, location => location.pathname, {
      from: {opacity: 0, transform: 'translate3d(100%,0,0)'},
      enter: {opacity: 1, transform: 'translate3d(0%,0,0)'},
      leave: {opacity: 0, transform: 'translate3d(-50%,0,0)'},
    })

    return (
      transitions.map(({item: location, props, key}) => (
        <animated.div key={key} style={props}>
          <Switch location={location}>
            <Route exact path="/cart" component={Cart} />
            <Route path={`/:slug/edit/:token`} component={EditShopPage} />
            <Route path={`/:slug`} component={ShopPage} />
            <Route exact path="/" component={Home} />
          </Switch>
        </animated.div>
      ))
    );
  };

  return <Router><AnimatedSwitch /></Router >
}
