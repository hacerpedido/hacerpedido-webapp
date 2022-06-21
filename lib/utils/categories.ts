// TODO: Rearmar todo esto en un modelo
// BUG: Las categorías del Typeform son diferentes, comparar con la q hay en BD
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
