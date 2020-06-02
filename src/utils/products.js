export function extractSections(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  const sections = [];

  let category = "";
  let items = [];

  products.forEach((product) => {
    if (category !== product.category) {
      // ignore the first case
      if (category !== "") {
        sections.push({
          category: category,
          products: items,
        });
      }
      category = product.category;
      items = [];
    }

    items.push(product);
  });

  if (category !== "") {
    sections.push({
      category: category,
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
      result.push(["", "", "", ""]);
      result.push(["", category, "", ""]);
      result.push(["", "", "", ""]);
    }
    result.push(["", product.name, product.description, product.price]);
  });

  // console.log(JSON.stringify(result, null, 2));

  return result;
}
