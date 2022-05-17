// TODO: Rearmar todo esto en un modelo
// BUG: Las categorías del Typeform son diferentes,
import { backgroundColors } from "@/lib/colors"

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
