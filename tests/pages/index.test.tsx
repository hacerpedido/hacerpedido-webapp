import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"

import { store } from "lib/reducers"
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
