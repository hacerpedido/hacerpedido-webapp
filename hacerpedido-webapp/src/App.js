import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Header from "./Header";
import Store from "./Store";

export default function App() {

  return (
    <Router>
      <div>
        <Header />

        <Switch>
          <Route path="/start">
            <div>Página para comercios</div>
          </Route>
          <Route path={`/:storeId`}>
            <Store />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
