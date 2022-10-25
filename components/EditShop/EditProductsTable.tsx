import dynamic from "next/dynamic"
import { useEffect, useMemo, useCallback, useRef } from "react"
import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"

import theme from "lib/theme"
import { productsToRows, productsFromRows } from "lib/utils/products"
import type { Product } from "types"

const CustomTable = dynamic(
  async () => {
    await import("handsontable/dist/handsontable.full.css")
    await import("handsontable/languages/es-MX")
    const { HotTable } = await import("@handsontable/react")

    return ({ forwardedRef, ...props }) => (
      <HotTable ref={forwardedRef} {...props} />
    )
  },
  {
    ssr: false,
  }
)

type Props = {
  shopId: string
  products: Product[]
  setTempProducts: (products: Product[]) => void
}

const EditProductsTable = ({ products, shopId, setTempProducts }: Props) => {
  const grid = useRef(null)
  const data = useMemo(() => productsToRows(products), [products])

  function catRenderer(instance, td, row, col, prop, value, cellProperties) {
    if (col === 1) {
      td.style.fontWeight = "bold"
    } else {
      td.style.backgroundColor = "#EEE"
    }
  }

  const getCells = useCallback(
    (row: number, col: number) => {
      if (grid.current == null) return {}

      let readOnly = false
      let renderer = undefined

      const tempData = grid.current.hotInstance.getDataAtRow(row)

      // if is category use a special renderer and make description and price coulmns readonly
      if (tempData[0] && col > 0) {
        renderer = catRenderer

        if (col === 2 || col === 3) readOnly = true
      }

      return { renderer, readOnly }
    },
    [grid]
  )

  useEffect(() => {
    // Sets an interval to update category rows using the custom renderer?
    const check = () => {
      if (grid.current) {
        grid.current.hotInstance.updateSettings({ cells: getCells })

        return
      }
    }
    const timer = setTimeout(check, 50)

    return () => clearTimeout(timer)
  }, [grid, getCells])

  const colHeaders = ["Título", "Nombre", "Descripción", "Precio"]

  const columns = [
    {
      type: "checkbox",
      className: "htCenter",
    },
    { type: "text" },
    { type: "text" },
    {
      type: "text",
      className: "htRight",
    },
  ]

  // NOTE: sanitices pasted elements
  const beforeChange = (changes, source) => {
    if (source !== "CopyPaste.paste") return

    changes.forEach((c) => {
      if (c[1] === 0) {
        if (typeof c[3] === "string") {
          c[3] = c[3].toLowerCase() === "true"
        }
      } else if (c[1] === 3) {
        c[3] = c[3] // TODO: Remove?
      }
    })
  }

  // NOTE: Updates preview products after the table changes
  const afterChange = (changes) => {
    if (changes == null || grid.current == null) return

    const tempData = grid.current.hotInstance.getData()
    const prods = productsFromRows(shopId, tempData)
    setTempProducts(prods)
  }

  const colWidths = (index: number) => {
    const width = window.innerWidth

    switch (index) {
      case 0:
        return 50
      case 3:
        return 90
      default:
        const otherElementsWidth = width > 1000 ? 644 : 244
        return (width - otherElementsWidth) / 2
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú o listado de precios</Text>
      <CustomTable
        forwardedRef={grid}
        data={data}
        licenseKey={"non-commercial-and-evaluation"}
        beforeChange={beforeChange}
        afterChange={afterChange}
        minSpareRows={10}
        language={"es-MX"}
        preventOverflow={"horizontal"}
        columns={columns}
        colHeaders={colHeaders}
        contextMenu={["row_above", "row_below", "remove_row"]}
        colWidths={colWidths}
      />
    </View>
  )
}

export default EditProductsTable

type Styles = {
  title: TextStyle
  container: ViewStyle
}

const styles = StyleSheet.create<Styles>({
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
