import * as utils from "./utils";

// TODO: Promociones should go first
export function extractSections(products=[]) {
  const sections = [];
  let lastCategory = "";
  let items = [];

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

export function productForGrid(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  const result = [];
  let category = "";

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

export function productsFromGrid(shopID, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const result = [];
  var section = "";
  var itemNumber = 0;

  rows.forEach((row) => {
    const isCategory = row[0];
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

    let product = {
      name: utils.sanitizeProductName(name),
      price: price ? utils.sanitizePrice(price).toString() : "",
      category: section,
      shopid: shopID,
      itemnumber: itemNumber,
    };

    if (description != null && description !== "") {
      product.description = description;
    }

    result.push(product);
  });

  // console.log(JSON.stringify(result, null, 2));

  return result;
}
