import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef } from "react";

import "handsontable/dist/handsontable.full.css";

import useWidth from "../../lib/hooks/use_width";
import { productForGrid, productsFromGrid } from "../../lib/utils/products";
import { sanitizePrice } from "../../lib/utils/utils";
import styles from "./EditProducts.module.css";

let handsontableCore;

const HotTable = dynamic(
  async () => {
    const { default: Handsontable } = await import("handsontable");
    await import("handsontable/languages/es-MX");
    const { default: HT } = await import("@handsontable/react");
    handsontableCore = Handsontable;

    return ({ forwardedRef, ...props }) => <HT ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
  },
);

const EditProducts = ({ products, shopId, onTempProductsChange }) => {
  const grid = useRef(null);
  useWidth();

  const gridData = useMemo(() => productForGrid(products), [products]);

  useEffect(() => {
    const check = () => {
      if (grid.current) {
        grid.current.hotInstance.updateSettings({
          cells: getCells,
        });

        return;
      }
      setTimeout(check, 50);
    };
    check();
  }, [grid]);

  const afterChange = (changes) => {
    if (changes == null || grid.current == null) {
      return;
    }

    const tempData = grid.current.hotInstance.getData();
    const tempProducts = productsFromGrid(shopId, tempData);

    onTempProductsChange(tempProducts);
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
    cellProperties,
  ) {
    void cellProperties;
    handsontableCore.renderers.TextRenderer.apply(this, arguments);

    if (col !== 1 && (!value || value === "")) {
      td.style.background = "#EEE";
    }

    if (col === 1) {
      td.style.fontWeight = "bold";
    }
  }

  function getCells(row, col) {
    var cellProperties = {};
    if (grid.current != null) {
      const tempData = grid.current.hotInstance.getDataAtRow(row);

      if (tempData[0] && col > 0) {
        cellProperties.renderer = categoryRenderer;

        if (col === 2 || col === 3) {
          cellProperties.readOnly = true;
        }
      }
    }

    return cellProperties;
  }

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

  const spareRows = 10;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Tu menú o listado de precios</h2>
      <HotTable
        afterChange={afterChange}
        beforeChange={beforeChanges}
        colHeaders={colHeaders}
        columns={columns}
        colWidths={(index) => {
          const width =
            typeof window !== "undefined" ? window.innerWidth : 1001;

          switch (index) {
            case 0:
              return 50;
            case 3:
              return 90;
            default: {
              const otherElementsWidth = width > 1000 ? 644 : 244;
              return (width - otherElementsWidth) / 2;
            }
          }
        }}
        contextMenu={["row_above", "row_below", "remove_row"]}
        data={gridData}
        forwardedRef={grid}
        language={"es-MX"}
        licenseKey={"non-commercial-and-evaluation"}
        minSpareRows={spareRows}
        preventOverflow={"horizontal"}
      />
    </section>
  );
};

export default EditProducts;
