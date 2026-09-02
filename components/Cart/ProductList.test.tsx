import { render, screen } from "@testing-library/react";
import React from "react";
import ProductList from "./ProductList";

describe("Cart ProductList", () => {
  test("groups products under their category headings", () => {
    render(
      <ProductList
        products={[
          {
            name: "Pizzas",
            products: [
              { amount: 1, description: "Grande", id: 1, name: "Muzzarella" },
              {
                amount: 2,
                description: "Individual",
                id: 2,
                name: "Napolitana",
              },
            ],
          },
          {
            name: "Bebidas",
            products: [
              { amount: 1, description: "500 ml", id: 3, name: "Agua" },
            ],
          },
        ]}
        shop={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "Pizzas" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Bebidas" })).toBeTruthy();
    expect(screen.getByText("Muzzarella")).toBeTruthy();
    expect(screen.getByText("Napolitana")).toBeTruthy();
    expect(screen.getByText("Agua")).toBeTruthy();
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });
});
