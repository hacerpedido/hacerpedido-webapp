import { capitalize, groupBy } from "lodash"

import { sanitizeProductName } from "./utils"

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

  // NOTE: find `Promociones` category and move it to the top of the list
  const index = categoriesWithProducts.findIndex(
    ({ name }) => name === "Promociones"
  )

  if (index >= 0)
    categoriesWithProducts.unshift(categoriesWithProducts.splice(index, 1)[0])

  return categoriesWithProducts
}

type ProductRow = [boolean, string, string | undefined, string | undefined]

export function productsToRows(products: Product[]): ProductRow[] {
  const rows: ProductRow[] = []
  let category = ""

  products.forEach((product) => {
    // adds extra category row if category is different
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

export function productsFromRows(
  shopId: string,
  rows: ProductRow[]
): Product[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const result: Product[] = []
  let category = ""
  let itemNumber = 1

  rows.forEach((row) => {
    const isCategory = row[0]
    const name = row[1]
    const description = row[2]
    const price = row[3]

    if (name == null || name === "") return

    // Don't save categories as products
    if (isCategory) {
      category = capitalize(name)
      return
    }

    const product = {
      name: sanitizeProductName(name),
      price: price,
      category,
      shopid: shopId,
      itemnumber: itemNumber++,
      description: description ? description : "",
    }

    result.push(product)
  })

  return result
}
