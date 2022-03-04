import { render } from "@testing-library/react"
import { Provider } from "react-redux"

import { store } from "@/common/reducers"
import Form from "@/components/Cart/Form"

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
