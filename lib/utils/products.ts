import { Product } from "../../types"

import { toTitleCase, sanitizePrice, sanitizeProductName } from "./utils"

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
  const result: any[] = []
  let category = ""

  products.forEach((product) => {
    if (category !== product.category) {
      category = product.category
      result.push([false, "", "", ""])
      result.push([true, category, "", ""])
      result.push([false, "", "", ""])
    }
    result.push([false, product.name, product.description, product.price])
  })

  return result
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
