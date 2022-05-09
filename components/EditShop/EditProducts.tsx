import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useCallback, useState } from "react"
import { StyleSheet, Text, View } from "react-native"

import theme from "@/common/theme"
import { productForGrid, productsFromGrid } from "@/common/utils/products"
import { sanitizePrice } from "@/common/utils/utils"

import type { Shop, Product } from "types"

type Props = {
  shop: Shop
  products: Product[]
  setProducts: (products: Product[]) => void
}

const EditProducts = ({ shop, products, setProducts }: Props) => {
  const grid = useRef(null)
  const [data, setData] = useState(productForGrid(products)) // this should be one time only

  // function categoryRenderer(
  //   instance,
  //   td,
  //   row,
  //   col,
  //   prop,
  //   value,
  //   cellProperties
  // ) {
  //   // TODO: Add this
  //   // Handsontable.renderers.TextRenderer.apply(this, arguments)
  //
  //   if (col !== 1 && (!value || value === "")) {
  //     td.style.background = "#EEE"
  //   }
  //
  //   if (col === 1) {
  //     td.style.fontWeight = "bold"
  //   }
  // }

  // const getCells = useCallback((row, col) => {
  //   const cellProperties = {}
  //   if (grid.current != null) {
  //     const tempData = grid.current.hotInstance.getDataAtRow(row)
  //
  //     if (tempData[0] && col > 0) {
  //       cellProperties.renderer = categoryRenderer
  //
  //       if (col === 2 || col === 3) {
  //         cellProperties.readOnly = true
  //       }
  //     }
  //   }
  //   return cellProperties
  // }, [])

  // useEffect(() => {
  //   const check = () => {
  //     if (grid.current) {
  //       grid.current.hotInstance.updateSettings({
  //         cells: getCells,
  //       })
  //
  //       return
  //     }
  //     setTimeout(check, 50)
  //   }
  //   check()
  // }, [grid, getCells])

  // const spareRows = 10
  // const colHeaders = ["Título", "Nombre", "Descripción", "Precio"]

  // const columns = [
  //   {
  //     type: "checkbox",
  //     className: "htCenter",
  //   },
  //   {
  //     type: "text",
  //   },
  //   {
  //     type: "text",
  //   },
  //   {
  //     type: "text",
  //     className: "htRight",
  //   },
  // ]

  const afterChange = (changes, source) => {
    if (source !== "edit") {
      return
    }

    // const row = changes[0]
    // const column = changes[1]
    // const from = changes[2]
    // const to = changes[3]

    const updatedProduct = {
      itemnumber: 0,
      category: "category",
      description: "description",
      name: "name",
      price: "1",
      shopid: shop.id,
    }

    const updatedProducts = [...products, updatedProduct]
    setProducts(updatedProducts)
    const griddata = grid.current.hotinstance.getdata()
    setData(griddata)
  }

  // const beforeChanges = (changes, source) => {
  //   if (source !== "CopyPaste.paste") {
  //     return
  //   }
  //
  //   let j
  //   for (j = 0; j < changes.length; j++) {
  //     // título?
  //     if (changes[j][1] === 0) {
  //       if (typeof changes[j][3] === "string") {
  //         changes[j][3] = changes[j][3].toLowerCase() === "true"
  //       }
  //     } else if (changes[j][1] === 3) {
  //       // precio
  //       changes[j][3] = sanitizePrice(changes[j][3])
  //     }
  //   }
  // }

  // const colWidths = (index: number) => {
  //   const width = typeof window !== "undefined" ? window.innerWidth : 1001
  //
  //   switch (index) {
  //     case 0:
  //       return 50
  //     case 3:
  //       return 90
  //     default:
  //       const otherElementsWidth = width > 1000 ? 644 : 244
  //       return (width - otherElementsWidth) / 2
  //   }
  // }

  // https://github.com/handsontable/handsontable/issues/7445
  const CustomTable = dynamic(
    async () => {
      await import("handsontable/dist/handsontable.full.css")
      // await import("handsontable/languages/es-MX")
      const { HotTable } = await import("@handsontable/react")

      return ({ forwardedRef, ...props }) => (
        <HotTable ref={forwardedRef} {...props} />
      )
    },
    {
      ssr: false,
    }
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú o listado de precios</Text>

      <CustomTable
        forwardedRef={grid}
        // ref={grid}
        settings={{
          data: data,
          licenseKey: "non-commercial-and-evaluation",
          afterChange: afterChange,
          // colHeaders: colHeaders,
          // columns: { columns },
          // beforeChange: beforeChanges,
          // forwardedRef={grid}
          // minSpareRows={spareRows}
          // language={"es-MX"}
          // preventOverflow={"horizontal"}
          // contextMenu={["row_above", "row_below", "remove_row"]}
          // colWidths={colWidths}
        }}
      />
    </View>
  )
}

export default EditProducts

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
  },
  title: {
    ...theme.text.title,
    lineHeight: "2em",
    marginTop: 30,
    marginVertical: 10,
  },
})
