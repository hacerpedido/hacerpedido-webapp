import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, ScrollView, View} from "react-native";

import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ProductList from "./ProductList";
import Loading from "components/Loading";
import colors from "assets/colors";

export default ({isPreview, shop, previewProducts}) => {
  const isLoading = useSelector((state) => state.app.loading);

  // TODO: Esto habría que limpiarlo, lo dejo 
  // por ahora para no romper el carrito
  let products;
  if (isPreview) {
    products = previewProducts ?? [];
  } else {
    products = shop?.productsByShopid?.nodes ?? [];
  }
  
  return (
    <ScrollView>
      <ShopHeader isPreview={isPreview} shop={shop} />
      <View style={styles.container}>
        {(!isPreview && isLoading) ? <Loading /> : (
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
