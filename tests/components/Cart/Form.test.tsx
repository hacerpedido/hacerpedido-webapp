import { render } from "@testing-library/react"

import Form from "@/components/Cart/Form"

describe("cart/Form", () => {
  it("renders correctly", () => {
    const { asFragment } = render(<Form onSubmit={() => {}} />)
    const renderFragment = asFragment()
  })
})
