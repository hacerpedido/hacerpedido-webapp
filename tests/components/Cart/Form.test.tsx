import { render } from "@testing-library/react"
import { Provider } from "react-redux"

import Form from "@/components/Cart/Form"
import { store } from "@/store/configureStore"

describe("cart/Form", () => {
  it("renders correctly", () => {
    const { asFragment } = render(
      <Provider store={store}>
        <Form onSubmit={() => {}} />
      </Provider>
    )
    const renderFragment = asFragment()
    expect(renderFragment).toMatchSnapshot()
  })
})
