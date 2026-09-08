import { render, screen } from "@testing-library/react";
import ProductList from "./ProductList";

describe("Shop ProductList", () => {
  test("renders category transitions and products in order", () => {
    render(
      <ProductList
        products={[
          {
            category: "Promociones",
            description: "Combo",
            id: 1,
            name: "Promo",
            price: 100,
          },
          {
            category: "Pizzas",
            description: "Grande",
            id: 2,
            name: "Muzzarella",
            price: 250,
          },
          {
            category: "Pizzas",
            description: "Especial",
            id: 3,
            name: "Napolitana",
            price: 300,
          },
          {
            category: "Bebidas",
            description: "500 ml",
            id: 4,
            name: "Agua",
            price: 80,
          },
        ]}
      />,
    );

    expect(screen.getByText("Promociones")).toBeTruthy();
    expect(screen.getByText("Pizzas")).toBeTruthy();
    expect(screen.getByText("Bebidas")).toBeTruthy();
    expect(screen.getByText("Promo")).toBeTruthy();
    expect(screen.getByText("Muzzarella")).toBeTruthy();
    expect(screen.getByText("Napolitana")).toBeTruthy();
    expect(screen.getByText("Agua")).toBeTruthy();
    expect(screen.getAllByRole("separator")).toHaveLength(3);
  });
});
