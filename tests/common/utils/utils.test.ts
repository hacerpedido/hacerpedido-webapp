import {
  sanitizePrice,
  sanitizeAddress,
  sanitizeProductName,
  sanitizeWhatsAppNumber,
} from "@/common/utils/utils"

describe("sanitizePrice", () => {
  it("remove spaces from prices", () => {
    expect(sanitizePrice("   100   ")).toBe(100)
  })
  it("remove $ from prices", () => {
    expect(sanitizePrice("$1")).toBe(1)
  })
  it("remove ,00 from prices", () => {
    expect(sanitizePrice("1,00")).toBe(1)
  })
  it("remove .00 from prices", () => {
    expect(sanitizePrice("1.00")).toBe(1)
  })
  it("remove . thousand separators from prices", () => {
    expect(sanitizePrice("1,000")).toBe(1000)
  })
})

describe("sanitizeAddress", () => {
  it("remove spaces from address", () => {
    expect(sanitizeAddress("  ALGO   ")).toBe("Algo")
  })
  it("remove NO from address", () => {
    expect(sanitizeAddress("NO")).toBe("")
  })
  it("remove no from address", () => {
    expect(sanitizeAddress("no")).toBe("")
  })
  it("ignore null address", () => {
    expect(sanitizeAddress()).toBe("")
  })
})

describe("sanitizeWhatsAppNumber", () => {
  it("add 9 and remove + to WhatsAppNumber", () => {
    expect(sanitizeWhatsAppNumber("+54223000000")).toBe("549223000000")
  })
  it("remove 0 from WhatsAppNumber if needed", () => {
    expect(sanitizeWhatsAppNumber("+540223000000")).toBe("549223000000")
  })
})

describe("sanitizeProductName", () => {
  it("capitalize all uppercase name", () => {
    expect(sanitizeProductName("PRODUCT NAME")).toBe("Product Name")
  })
  it("capitalize first letter and ignore rest if the name has mixed caps", () => {
    expect(sanitizeProductName("product NAME")).toBe("Product NAME")
  })
})
