import React from "react";
import { useSelector } from "react-redux";
import { StyleSheet, ScrollView, View } from "react-native";

import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ShopFooter from "./ShopFooter";
import ProductList from "./ProductList";
import Loading from "../../components/Loading";
import colors from "../../assets/colors";

export default ({ shop, products }) => {
  const isLoading = useSelector((state) => state.loading);

  return (
    <>
      <ScrollView>
        <ShopHeader shop={shop} />
        <View style={styles.container}>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {products.length > 0 && (
                <>
                  <ProductList products={products} />
                  <ShopNotes shop={shop} />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {/* TODO: Quitar el view */}
      <View style={styles.footer}>
        <ShopFooter shop={shop} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
  footer: {
    backgroundColor: colors.lightBackground,
    bottom: 0,
    height: 100,
    position: "fixed",
    width: "100%",
  },
  spinner: {
    alignItems: "center",
  },
});
