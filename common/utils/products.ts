import { toTitleCase, sanitizePrice, sanitizeProductName } from "./utils"

import type { Product } from "types"

// TODO: Promociones should go first

export function extractSections(products: Product[] = []) {
  const sections = []
  let categoryProducts: Product[] = []
  let lastCategory = ""

  products.forEach((product) => {
    if (lastCategory != product.category) {
      // ignore the first case
      if (lastCategory) {
        const section = { name: lastCategory, products: categoryProducts }
        sections.push(section)
      }

      lastCategory = product.category
      categoryProducts = []
    }

    categoryProducts.push(product)
  })

  if (lastCategory) {
    const section = { name: lastCategory, products: categoryProducts }
    sections.push(section)
  }

  return sections
}

export function productForGrid(products: Product[]) {
  if (!Array.isArray(products) || products.length === 0) {
    return []
  }
  const rows: any[] = [] // NOTE: this should be a row HoT type
  let category = ""

  products.forEach((product) => {
    if (category !== product.category) {
      category = product.category
      rows.push([false, "", "", ""])
      rows.push([true, category, "", ""])
      rows.push([false, "", "", ""])
    }
    rows.push([false, product.name, product.description, product.price])
  })

  return rows
}

export function productsFromGrid(shopID: number, rows: any[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const result: any[] = []
  let section = ""
  let itemNumber = 0

  rows.forEach((row) => {
    const isCategory = row[0]
    const name = row[1]
    const description = row[2]
    const price = row[3]

    if (name == null || name === "") {
      return
    }

    if (isCategory) {
      section = toTitleCase(name)

      return
    }

    itemNumber++

    const product = {
      category: section,
      description: description,
      itemnumber: itemNumber,
      name: sanitizeProductName(name),
      price: price ? sanitizePrice(price).toString() : "",
      shopid: shopID,
    }

    result.push(product)
  })

  return result
}
