import { render, screen } from "@testing-library/react"
import { store } from "lib/store"
import { Provider } from "react-redux"

import Home from "pages/index"

describe("home", () => {
  it("renders a heading", () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    )
    const input = screen.getByLabelText("Username")
    // expect(input).to ...a
  })
})
