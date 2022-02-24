import { extractSections } from "./products"

describe("extraSections", () => {
  test("handle undefined", () => {
    expect(extractSections()).toEqual([])
  })

  test("handle empty list", () => {
    expect([]).toEqual([])
  })

  test("handle one section", () => {
    const result = extractSections([{ category: "a", name: "A" }])

    expect(result).toHaveLength(1)
    expect(result[0].products).toHaveLength(1)
  })

  test("handle one section", () => {
    const result = extractSections([
      { category: "a", name: "A" },
      { category: "a", name: "B" },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].products).toHaveLength(2)
  })

  test("return multiple sections", () => {
    const products = [
      { category: "a", name: "nameA" },
      { category: "a", name: "nameB" },
      { category: "b", name: "nameC" },
      { category: "b", name: "nameD" },
      { category: "b", name: "nameE" },
      { category: "c", name: "nameF" },
    ]

    const result = extractSections(products)

    expect(result).toHaveLength(3)
    expect(result[0].name).toBe("a")
    expect(result[1].name).toBe("b")
    expect(result[2].name).toBe("c")
    expect(result[0].products).toHaveLength(2)
    expect(result[1].products).toHaveLength(3)
    expect(result[2].products).toHaveLength(1)
  })
})
