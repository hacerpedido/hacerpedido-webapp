import { render } from "@testing-library/react"

import HomeHeader from "@/components/Home/HomeHeader"

describe("homeHeader", () => {
  it("renders correctly", () => {
    const { asFragment } = render(<HomeHeader />)
    const renderFragment = asFragment()
    expect(renderFragment).toMatchSnapshot()
  })
})
