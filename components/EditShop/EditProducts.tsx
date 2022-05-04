import "handsontable/dist/handsontable.full.css"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useCallback } from "react"
import { StyleSheet, Text, View } from "react-native"

import { useAppDispatch as useDispatch } from "@/common/hooks"
import theme from "@/common/theme"
import { productForGrid, productsFromGrid } from "@/common/utils/products"
import { sanitizePrice } from "@/common/utils/utils"

import type { Product } from "types"

type Props = {
  products: Product[]
  shopId: number
  setTempProducts: () => null
}

const EditProducts = ({ products, shopId, setTempProducts }: Props) => {
  const dispatch = useDispatch()
  const grid = useRef(null)
  const gridData = useMemo(() => productForGrid(products), [products])

  useEffect(() => {
    const check = () => {
      if (grid.current) {
        grid.current.hotInstance.updateSettings({
          cells: getCells,
        })

        return
      }
      setTimeout(check, 50)
    }
    check()
  }, [grid, getCells])

  const getCells = useCallback((row, col) => {
    const cellProperties = {}
    if (grid.current != null) {
      const tempData = grid.current.hotInstance.getDataAtRow(row)

      if (tempData[0] && col > 0) {
        cellProperties.renderer = categoryRenderer

        if (col === 2 || col === 3) {
          cellProperties.readOnly = true
        }
      }
    }
    return cellProperties
  }, [])

  const spareRows = 10
  const colHeaders = ["Título", "Nombre", "Descripción", "Precio"]

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
  ]

  const afterChange = (changes) => {
    if (changes == null || grid.current == null) {
      return
    }

    const tempData = grid.current.hotInstance.getData()
    const tempProducts = productsFromGrid(shopId, tempData)

    dispatch(setTempProducts({ shopId, tempProducts }))
  }

  function categoryRenderer(
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
  ) {
    // TODO: Add this
    // Handsontable.renderers.TextRenderer.apply(this, arguments)

    if (col !== 1 && (!value || value === "")) {
      td.style.background = "#EEE"
    }

    if (col === 1) {
      td.style.fontWeight = "bold"
    }
  }

  const beforeChanges = (changes, source) => {
    if (source !== "CopyPaste.paste") {
      return
    }

    let j
    for (j = 0; j < changes.length; j++) {
      // título?
      if (changes[j][1] === 0) {
        if (typeof changes[j][3] === "string") {
          changes[j][3] = changes[j][3].toLowerCase() === "true"
        }
      } else if (changes[j][1] === 3) {
        // precio
        changes[j][3] = sanitizePrice(changes[j][3])
      }
    }
  }

  const colWidths = (index: number) => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1001

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

  const HotTable = dynamic(
    async () => {
      // await import("handsontable")
      await import("handsontable/languages/es-MX")
      const { default: HT } = await import("@handsontable/react")

      return ({ forwardedRef, ...props }) => (
        <HT ref={forwardedRef} {...props} />
      )
    },
    {
      ssr: false,
    }
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu menú o listado de precios</Text>

      <HotTable
        data={gridData}
        colHeaders={colHeaders}
        forwardedRef={grid}
        licenseKey={"non-commercial-and-evaluation"}
        afterChange={afterChange}
        beforeChange={beforeChanges}
        minSpareRows={spareRows}
        language={"es-MX"}
        preventOverflow={"horizontal"}
        columns={columns}
        contextMenu={["row_above", "row_below", "remove_row"]}
        colWidths={colWidths}
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
