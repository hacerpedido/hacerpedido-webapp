import { groupBy } from "lodash"

import { toTitleCase, sanitizePrice, sanitizeProductName } from "./utils"

import type { Product, CartItem } from "types"

export const groupAndSortByCategory = (
  products: Product[] | readonly Product[] | CartItem[]
) => {
  const groupedProducts = groupBy(products, "category")
  const categoriesWithProducts = Object.keys(groupedProducts).map(
    (category) => {
      return { name: category, products: groupedProducts[category] }
    }
  )
  const index = categoriesWithProducts.findIndex(
    ({ name }) => name === "Promociones"
  )
  categoriesWithProducts.unshift(categoriesWithProducts.splice(index, 1)[0])

  return categoriesWithProducts
}

type ProductRow = [boolean, string, string, string]
export function productForGrid(products: Product[]) {
  if (products.length === 0) {
    return []
  }
  const rows: ProductRow[] = []
  let category = ""

  products.forEach((product) => {
    if (category !== product.category) {
      category = product.category

      rows.push([false, "", "", ""])
      rows.push([true, category, "", ""])
      rows.push([false, "", "", ""])
    }

    // TODO: should use db default props for price and description
    rows.push([
      false,
      product.name,
      product.description || "",
      product.price || "",
    ])
  })

  return rows
}

export function productsFromGrid(shopId: string, rows: ProductRow[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const result: Product[] = []
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
      shopid: shopId,
    } // Product

    result.push(product)
  })

  return result
}
