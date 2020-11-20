//
// TODO: Rearmar todo esto en un modelo
//
// TODO: Las categorías del Typeform son diferentes,
// deberíamos permitir múltiples nombres para las categorías
// i.e: Productos saludables > Saludable

// TODO: Refactor
const backgroundColors = {
  Comida: "#3CC077",
  Cervecerías: "#BFBE3B",
  "Helados y Postres": "#D83E3D",
  Panadería: "#D4A9C0",
  Saludable: "#EFA43D",
  "Almacén / Kiosko": "#3C6AC0",
  Cafetería: "#C0733D",
  Bebidas: "#A83434",
  Otros: "#3CA9C0",
  // Farmacia: "#7F3CC0",
  // "Fruta y Verdura": "#C1BE3D",
};

export function getBackgroundColorForCategory(category) {
  return backgroundColors[category];
}

// TODO: Refactor, extraer valores, meter en un modelo
export function getBackgroundForCategory(category) {
  let background = "";

  switch (category) {
    case "Comida":
      background = `comida.jpg`;
      break;
    case "Cervecerías":
      background = `cerveceria.jpg`;
      break;
    case "Helados y Postres":
      background = `helados.jpg`;
      break;
    case "Panadería":
      background = `panaderia.jpg`;
      break;
    case "Saludable":
      background = `saludable.jpg`;
      break;
    case "Almacén / Kiosko":
      background = `kiosko.jpg`;
      break;
    case "Cafetería":
      background = `cafe.jpg`;
      break;
    case "Bebidas":
      background = `bebida.jpg`;
      break;
    case "Otros":
      background = `otros.jpg`;
      break;
    // case "Farmacia":
    //   background = `url(${Backgrounds.Farmacia})`;
    //   break;
    // case "Fruta y Verdura":
    //   background = `verduleria.jpg`;
    //   break;

    default:
      break;
  }

  return `/public/images/backgrounds/${background}`;
}
