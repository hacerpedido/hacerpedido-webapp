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
          category: product.category,
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

  return sections;
}
