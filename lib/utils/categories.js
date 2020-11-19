export const categories = [
  'Comida',
  'Cervecerías',
  'Helados y Postres',
  'Panadería',
  'Saludable', // Productos saludables
  'Almacén / Kiosko', // Kiosko, almacén, minimercado
  'Cafetería',
  'Bebidas', // Bebidas alcohólicas
  'Otros', // Otro
]

export function sanitizeCategory(oldCategory) {
  if (categories.includes(oldCategory)) {
    return oldCategory
  }

  switch (oldCategory) {
    case 'Bebida':
      return 'Bebidas'

    case 'Bebidas alcoholicas':
      return 'Bebidas'

    case 'Bebidas alcohólicas':
      return 'Bebidas'

    case 'Cafeteria':
      return 'Cafetería'

    case 'Farmacia':
      return 'Otros'

    case 'Kiosco, almacén, minimercado':
      return 'Almacén / Kiosko'

    case 'Kiosco/almacen':
      return 'Almacén / Kiosko'

    case 'Minimercado/supermercado':
      return 'Almacén / Kiosko'

    case 'Productos saludables':
      return 'Saludable'

    case 'Otros (alimento para mascotas, tecnología, productos congelados, viandas)':
      return 'Otros'

    case 'Restaurante':
      return 'Comida'

    case 'Verdulería y frutería':
      return 'Comida'

    default:
      console.log('ERROR: ' + oldCategory + ' no está considerada como una categoría.')
      return oldCategory
  }
}
