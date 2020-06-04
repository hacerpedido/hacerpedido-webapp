import React, { useMemo, useRef } from "react";
// import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";

import { productForGrid, productsFromGrid } from "utils/products";
import { setTempProducts } from "reducers/shopEditSlice";
import theme from "assets/theme";

export default ({ products, shopId }) => {
  const dispatch = useDispatch();
  const grid = useRef(null);

  let gridData = useMemo(() => productForGrid(products), [products]);

  const afterChange = (changes) => {
    if (changes == null || grid.current == null) {
      return;
    }

    let tempData = grid.current.hotInstance.getData();
    let tempProducts = productsFromGrid(shopId, tempData);

    dispatch(setTempProducts({ shopId, tempProducts }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Tu menú o listado de precios</Text>
      <HotTable
        ref={grid}
        data={gridData}
        style={{ ...styles.grid }}
        licenseKey={"non-commercial-and-evaluation"}
        afterChange={afterChange}
        minSpareRows={5}
        colWidths={[300, 300, 90]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
  },
  grid: {
    // color: theme.colors.error,
    // flex: 0.5,
    // marginVertical: 100,
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
});
