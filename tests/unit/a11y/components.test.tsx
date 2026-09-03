// @ts-nocheck
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ShopCard from "../../../components/Home/ShopCard";
import Input from "../../../components/Input";
import ShopInput from "../../../components/ShopInput";

expect.extend(toHaveNoViolations);

const baseShop = {
  address: "Calle 123",
  category: "Comida",
  deliverycost: "$500",
  name: "La Esquina",
  opentimes: "9 a 18",
  ordersphonenumber: "2230000000",
  orderswhatsappnumber: "5492230000000",
  slug: "la-esquina",
};

describe("a11y: customer-facing components", () => {
  test("ShopCard has no a11y violations", async () => {
    const { container } = render(<ShopCard shop={baseShop} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Input with label has no a11y violations", async () => {
    const { container } = render(<Input label="Nombre" name="name" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("Input without label still has no a11y violations", async () => {
    const { container } = render(<Input aria-label="Nombre" name="name" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("ShopInput with label has no a11y violations", async () => {
    const { container } = render(
      <ShopInput label="Dirección" name="address" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
