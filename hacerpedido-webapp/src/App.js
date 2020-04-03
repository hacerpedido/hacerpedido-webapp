import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import API from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";
import { ApplicationProvider, Layout } from "@ui-kitten/components";
import { mapping, light as lightTheme } from "@eva-design/eva";
import { default as appTheme } from './custom-theme.json';
import { StyleSheet } from 'react-native';

import Home from "./Home";
import Header from "./Header";
import Store from "./Shop";
import Admin from "./Admin";
import AdminShopsImport from "./AdminShopsImport";

import awsconfig from "./aws-exports";

API.configure(awsconfig);
PubSub.configure(awsconfig);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1
  },
});

const HomeScreen = () => (
    <Router>
      <Layout>
        <Header />
        <Layout style={styles.container}>

        <Switch>
          <Route path="/admin/shops-import">
            <AdminShopsImport />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/start">
            <div>Página para comercios</div>
          </Route>
          <Route path={`/:slug`}>
            <Store />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        </Layout>

      </Layout>
    </Router>
);

const theme = { ...lightTheme, ...appTheme };

export default function App() {
  return (
    <ApplicationProvider mapping={mapping} theme={theme}>
      <HomeScreen />
    </ApplicationProvider>
  );
}
