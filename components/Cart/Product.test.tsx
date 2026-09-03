import { render, screen } from "@testing-library/react";
import Product from "./Product";

describe("Cart Product", () => {
  test("renders the quantity, name, and description", () => {
    render(
      <Product
        product={{ amount: 2, description: "Con papas", name: "Hamburguesa" }}
      />,
    );

    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Hamburguesa")).toBeTruthy();
    expect(screen.getByText("Con papas")).toBeTruthy();
  });
});
