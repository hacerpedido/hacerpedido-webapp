import { sanitizeProductName } from "@/lib/utils/utils"

describe("sanitizeProductName", () => {
  it("capitalize all uppercase name", () => {
    expect(sanitizeProductName("PRODUCT NAME")).toBe("Product Name")
  })

  it("capitalize first letter and ignore rest if the name has mixed caps", () => {
    expect(sanitizeProductName("product NAME")).toBe("Product NAME")
  })
})
