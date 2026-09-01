import type { Product, ProductSection } from "../types";
import * as utils from "./utils";

// TODO: Promociones should go first
export function extractSections(products: Product[] = []): ProductSection[] {
  const sections: ProductSection[] = [];
  let lastCategory: string | null | undefined = "";
  let items: Product[] = [];

  products.forEach((product) => {
    if (lastCategory !== product.category) {
      // ignore the first case
      if (lastCategory !== "") {
        sections.push({ name: lastCategory, products: items });
      }

      lastCategory = product.category;
      items = [];
    }

    items.push(product);
  });

  if (lastCategory !== "") {
    sections.push({
      name: lastCategory,
      products: items,
    });
  }

  //   console.log(JSON.stringify(sections, null, 2));

  return sections;
}

export type ProductGridRow = [
  boolean,
  string | number | null | undefined,
  string | number | null | undefined,
  string | number | null | undefined,
];

export function productForGrid(
  products: Product[] | null | undefined,
): ProductGridRow[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  const result: ProductGridRow[] = [];
  let category: string | null | undefined = "";

  products.forEach((product) => {
    if (category !== product.category) {
      category = product.category;
      result.push([false, "", "", ""]);
      result.push([true, category, "", ""]);
      result.push([false, "", "", ""]);
    }
    result.push([false, product.name, product.description, product.price]);
  });

  // console.log(JSON.stringify(result, null, 2));

  return result;
}

export function productsFromGrid(
  shopID: string | number,
  rows: unknown[][] | null | undefined,
): Product[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const result: Product[] = [];
  let section = "";
  let itemNumber = 0;

  rows.forEach((row) => {
    const isCategory = Boolean(row[0]);
    const name = row[1];
    const description = row[2];
    const price = row[3];

    if (name == null || name === "") {
      return;
    }

    if (isCategory) {
      section = utils.toTitleCase(name);

      return;
    }

    itemNumber++;

    const product: Product = {
      name: utils.sanitizeProductName(name) as string | number,
      price: price ? utils.sanitizePrice(price).toString() : "",
      category: section,
      shopid: shopID,
      itemnumber: itemNumber,
    };

    if (description != null && description !== "") {
      product.description = description as string;
    }

    result.push(product);
  });

  // console.log(JSON.stringify(result, null, 2));

  return result;
}
