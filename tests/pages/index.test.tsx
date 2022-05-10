import { render, screen } from "@testing-library/react"

import Home from "pages/index"

describe("home", () => {
  it("renders a heading", () => {
    render(<Home />)
    const input = screen.getByLabelText("Username")
    // expect(input).to ...a
  })
})
