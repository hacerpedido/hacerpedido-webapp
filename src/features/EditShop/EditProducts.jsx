import React from "react";
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";

import { productForGrid } from "utils/products";
import theme from "assets/theme";

export default ({ products, shopId, sections }) => {
  // const dispatch = useDispatch();

  let grid = productForGrid(products);

  const afterChange = (changes, source) => {
    if (changes == null) {
      return;
    }
    changes.forEach(([row, prop, oldValue, newValue]) => {
      console.log("FC:", [row, prop, oldValue, newValue]);
      console.log("FC:", source);
      console.log("FC:", products[row]);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Tu menú o listado de precios</Text>
      <HotTable
        data={grid}
        style={{ ...styles.grid }}
        licenseKey={"non-commercial-and-evaluation"}
        afterChange={afterChange}
        // startCols={3}
        // startRows={grid.length}
        minSpareRows={5}
        colWidths={[0, 300, 300, 90]}
        hiddenColumns={{
          indicators: false,
          columns: [0],
        }}
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
