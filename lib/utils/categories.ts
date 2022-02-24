// TODO: Rearmar todo esto en un modelo
// BUG: Las categorías del Typeform son diferentes,
type BackgroundColors = {
  [key: string]: string
}

const backgroundColors: BackgroundColors = {
  Comida: "#3CC077",
  Cervecerías: "#BFBE3B",
  "Helados y Postres": "#D83E3D",
  Panadería: "#D4A9C0",
  Saludable: "#EFA43D",
  "Almacén / Kiosko": "#3C6AC0",
  Cafetería: "#C0733D",
  Bebidas: "#A83434",
  Otros: "#3CA9C0",
}

export function getBackgroundColorForCategory(category: string) {
  return backgroundColors[category]
}

export function getBackgroundForCategory(category: string) {
  let background = ""

  switch (category) {
    case "Comida":
      background = `comida.jpg`
      break
    case "Cervecerías":
      background = `cerveceria.jpg`
      break
    case "Helados y Postres":
      background = `helados.jpg`
      break
    case "Panadería":
      background = `panaderia.jpg`
      break
    case "Saludable":
      background = `saludable.jpg`
      break
    case "Almacén / Kiosko":
      background = `kiosko.jpg`
      break
    case "Cafetería":
      background = `cafe.jpg`
      break
    case "Bebidas":
      background = `bebida.jpg`
      break
    case "Otros":
      background = `otros.jpg`
      break
    case "Farmacia":
      background = `farmacia.jpg`
      break
    case "Fruta y Verdura":
      background = `verduleria.jpg`
      break
    default:
      break
  }

  return `url(/images/backgrounds/${background})`
}

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
]

export function sanitizeCategory(oldCategory: string) {
  if (categories.includes(oldCategory)) {
    return oldCategory
  }

  switch (oldCategory) {
    case "Bebida":
      return "Bebidas"

    case "Bebidas alcoholicas":
      return "Bebidas"

    case "Bebidas alcohólicas":
      return "Bebidas"

    case "Cafeteria":
      return "Cafetería"

    case "Farmacia":
      return "Otros"

    case "Kiosco, almacén, minimercado":
      return "Almacén / Kiosko"

    case "Kiosco/almacen":
      return "Almacén / Kiosko"

    case "Minimercado/supermercado":
      return "Almacén / Kiosko"

    case "Productos saludables":
      return "Saludable"

    case "Otros (alimento para mascotas, tecnología, productos congelados, viandas)":
      return "Otros"

    case "Restaurante":
      return "Comida"

    case "Verdulería y frutería":
      return "Comida"

    default:
      console.log(
        `ERROR: ${oldCategory} no está considerada como una categoría.`
      )
      return oldCategory
  }
}
