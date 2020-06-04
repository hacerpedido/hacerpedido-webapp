import React, { useMemo, useRef } from "react";
// import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";

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

  const colHeaders = ["Título", "Nombre", "Descripción", "Precio"];

  const columns = [
    {
      // data: "isCategory",
      type: "checkbox",
      className: "htCenter",
    },
    {
      type: "text",
      // data: "name",
    },
    {
      type: "text",
      // data: "description",
    },
    {
      // data: "price",
      // type: "numeric",
      type: "text",
      className: "htRight",
    },
  ];

  function categoryRenderer(
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
  ) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (!value || value === "") {
      td.style.background = "#EEE";
    }

    if (col === 1) {
      td.style.fontWeight = "bold";
    }
  }

  const getCells = (row, col) => {
    var cellProperties = {};
    if (grid.current != null) {
      let tempData = grid.current.hotInstance.getDataAtRow(row);

      if (col === 1 && tempData[0]) {
        cellProperties.renderer = categoryRenderer;
      }

      if ((col === 2 || col === 3) && tempData[0]) {
        cellProperties.readOnly = true;
        cellProperties.renderer = categoryRenderer;
      }
    }

    return cellProperties;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú o listado de precios</Text>
      <HotTable
        ref={grid}
        data={gridData}
        style={{ ...styles.grid }}
        licenseKey={"non-commercial-and-evaluation"}
        afterChange={afterChange}
        minSpareRows={5}
        cells={getCells}
        columns={columns}
        colHeaders={colHeaders}
        colWidths={[70, 300, 300, 90]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
  },
  grid: {},
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
});
