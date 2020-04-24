import * as Backgrounds from "./assets/images/backgrounds/";

//
// TODO: Rearmar todo esto en un modelo
//
// TODO: Las categorías del Typeform son diferentes,
// deberíamos permitir múltiples nombres para las categorías
// i.e: Productos saludables > Saludable

export const categories = [
  "Comida",
  "Cervecerías",
  "Helados y Postres",
  "Panadería",
  "Saludable", // Productos saludables
  "Almacén / Kiosko", // Kiosko, almacén, minimercado
  "Cafetería",
  "Bebidas", // Bebidas alcohólicas
  "Otros", // Otro
];

// TODO: Refactor
const backgroundColors = {
  Comida: "#3CC077",
  Cervecerías: "",
  "Helados y Postres": "",
  Panadería: "",
  Saludable: "",
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
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Cervecerías":
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Helados y Postres":
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Panadería":
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Saludable":
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Almacén / Kiosko":
      background = `url(${Backgrounds.Kiosko})`;
      break;
    case "Cafetería":
      background = `url(${Backgrounds.Cafe})`;
      break;
    case "Bebidas":
      background = `url(${Backgrounds.Bebida})`;
      break;
    case "Otros":
      background = `url(${Backgrounds.Otros})`;
      break;
    // case "Farmacia":
    //   background = `url(${Backgrounds.Farmacia})`;
    //   break;
    // case "Fruta y Verdura":
    //   background = `url(${Backgrounds.Verduleria})`;
    //   break;

    default:
      break;
  }

  return background;
}
