import * as Backgrounds from "./assets/images/backgrounds/";

//
// TODO: Rearmar todo esto en un modelo
//


export const categories = [
  "Comida",
  "Bebida",
  "Cafeteria",
  "Almacén / Kiosko",
  // "Fruta y Verdura",
  // "Café",
  // "Farmacia",
  "Otros",
];

// TODO: Refactor
const backgroundColors = {
  Bebida: "#A83434",
  Cafeteria: "#C0733D",
  Comida: "#3CC077",
  Farmacia: "#7F3CC0",
  "Almacén / Kiosko": "#3C6AC0",
  Otros: "#3CA9C0",
  "Fruta y Verdura": "#C1BE3D",
};

export function getBackgroundColorForCategory(category) {
  return backgroundColors[category];
}

// TODO: Refactor, extraer valores, meter en un modelo
export function getBackgroundForCategory(category) {
  let background = "";

  switch (category) {
    case "Bebida":
      background = `url(${Backgrounds.Bebida})`;
      break;
    case "Cafeteria":
      background = `url(${Backgrounds.Cafe})`;
      break;
    case "Comida":
      background = `url(${Backgrounds.Comida})`;
      break;
    case "Farmacia":
      background = `url(${Backgrounds.Farmacia})`;
      break;
    case "Almacén / Kiosko":
      background = `url(${Backgrounds.Kiosko})`;
      break;
    case "Otros":
      background = `url(${Backgrounds.Otros})`;
      break;
    case "Fruta y Verdura":
      background = `url(${Backgrounds.Verduleria})`;
      break;

    default:
      break;
  }

  return background;
}
