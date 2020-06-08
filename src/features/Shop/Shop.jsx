import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, ScrollView, View} from "react-native";

import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ProductList from "./ProductList";
import colors from "assets/colors";
import Loading from "components/Loading";

export default ({isPreview = false, shop, previewProducts = []}) => {
  const isLoading = useSelector((state) => state.app.loading);

  const products =
    isPreview ? previewProducts : useSelector(state => state.shop.products);

  return (
    <ScrollView>
      <ShopHeader isPreview={isPreview} shop={shop} />

      <View style={styles.container}>
        {(!isPreview && isLoading) ? <Loading /> :
          <>
            {products.length && (
              <>
                <ProductList products={products} isPreview={isPreview} />
                <ShopNotes shop={shop} />
              </>
            )}
          </>
        }
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
});
