import React, { useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { StyleSheet, Text, View } from "react-native";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import "handsontable/languages/es-MX";

import { productForGrid, productsFromGrid } from "utils/products";
import { setTempProducts } from "reducers/shopEditSlice";
import theme from "assets/theme";
import { sanitizePrice } from "utils/utils";
import { useWindowDimensions } from "components/WindowDimensionsProvider";

export default ({ products, shopId }) => {
  const dispatch = useDispatch();
  const grid = useRef(null);
  const { width } = useWindowDimensions();

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
      type: "checkbox",
      className: "htCenter",
    },
    {
      type: "text",
    },
    {
      type: "text",
    },
    {
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

    if (col !== 1 && (!value || value === "")) {
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

      if (tempData[0] && col > 0) {
        cellProperties.renderer = categoryRenderer;

        if (col === 2 || col === 3) {
          cellProperties.readOnly = true;
        }
      }
    }

    return cellProperties;
  };

  const beforeChanges = (changes, source) => {
    if (source !== "CopyPaste.paste") {
      return;
    }

    var j;
    for (j = 0; j < changes.length; j++) {
      // título?
      if (changes[j][1] === 0) {
        if (typeof changes[j][3] === "string") {
          changes[j][3] = changes[j][3].toLowerCase() === "true";
        }
      } else if (changes[j][1] === 3) {
        // precio
        changes[j][3] = sanitizePrice(changes[j][3]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú o listado de precios</Text>
      <HotTable
        height={4 + 23 * (gridData.length + 10)}
        ref={grid}
        data={gridData}
        licenseKey={"non-commercial-and-evaluation"}
        afterChange={afterChange}
        beforeChange={beforeChanges}
        minSpareRows={10}
        language={"es-MX"}
        preventOverflow={"horizontal"}
        cells={getCells}
        columns={columns}
        colHeaders={colHeaders}
        contextMenu={["row_above", "row_below", "remove_row"]}
        colWidths={(index) => {
          switch (index) {
            case 0:
              return 50;
            case 3:
              return 90;
            default:
              const otherElementsWidth = width >= 1000 ? 644 : 244;
              return (width - otherElementsWidth) / 2;
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    display: "block",
    flex: 1,
    maxWidth: "100%",
    // overflowX: "hidden",
  },
  title: {
    ...theme.text.title,
    lineHeight: "2em",
    marginTop: 30,
    marginVertical: 10,
  },
});
