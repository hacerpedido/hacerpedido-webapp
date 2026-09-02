import { categories, sanitizeCategory } from "./categories";

describe("sanitizeCategory", () => {
  test("keeps current categories unchanged", () => {
    for (const category of categories) {
      expect(sanitizeCategory(category)).toBe(category);
    }
  });

  test.each([
    ["Bebida", "Bebidas"],
    ["Bebidas alcoholicas", "Bebidas"],
    ["Bebidas alcohólicas", "Bebidas"],
    ["Cafeteria", "Cafetería"],
    ["Farmacia", "Otros"],
    ["Kiosco, almacén, minimercado", "Almacén / Kiosko"],
    ["Kiosco/almacen", "Almacén / Kiosko"],
    ["Minimercado/supermercado", "Almacén / Kiosko"],
    ["Productos saludables", "Saludable"],
    [
      "Otros (alimento para mascotas, tecnología, productos congelados, viandas)",
      "Otros",
    ],
    ["Restaurante", "Comida"],
    ["Verdulería y frutería", "Comida"],
  ])("maps legacy category %s to %s", (legacy, current) => {
    expect(sanitizeCategory(legacy)).toBe(current);
  });

  test("returns and logs unknown categories", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    expect(sanitizeCategory("Nueva categoría")).toBe("Nueva categoría");
    expect(log).toHaveBeenCalledWith(
      "ERROR: Nueva categoría no está considerada como una categoría.",
    );

    log.mockRestore();
  });
});
