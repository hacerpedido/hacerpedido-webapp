import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, ScrollView, View} from "react-native";

import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ProductList from "./ProductList";
import Loading from "components/Loading";
import colors from "assets/colors";

export default ({isPreview}) => {
  const isLoading = useSelector((state) => state.app.loading);
  const shop = useSelector((state) => state.shop.shop);
  let products = shop?.productsByShopid?.nodes ?? [];

  return (
    <ScrollView>
      <ShopHeader isPreview={isPreview} />
      <View style={styles.container}>
        {isLoading ? <Loading /> : (
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
});
