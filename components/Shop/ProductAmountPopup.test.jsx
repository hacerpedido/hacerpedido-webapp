import { useCart } from "#lib/context/CartContext";

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import ProductAmountPopup from "./ProductAmountPopup";

jest.mock("#lib/context/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("react-spring", () => ({
  animated: { div: "div" },
  config: { stiff: {} },
  useTransition: (visible) =>
    visible ? [{ item: true, key: "quantity-popup", props: {} }] : [],
}));

describe("ProductAmountPopup", () => {
  const dispatch = jest.fn();
  const product = { id: 7, name: "Empanada" };
  const handleClose = jest.fn();

  beforeEach(() => {
    dispatch.mockClear();
    handleClose.mockClear();
    useCart.mockReturnValue({ dispatch });
  });

  test("is not rendered while hidden", () => {
    render(
      <ProductAmountPopup
        amount={2}
        handleClose={handleClose}
        product={product}
        visible={false}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("changes quantity and persists it when adding the product", () => {
    render(
      <ProductAmountPopup
        amount={2}
        handleClose={handleClose}
        product={product}
        visible
      />,
    );

    expect(screen.getByText("2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByText("3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      payload: { amount: 3, product },
      type: "SET_AMOUNT",
    });
  });

  test("does not decrease quantity below zero and closes on request", () => {
    render(
      <ProductAmountPopup
        amount={0}
        handleClose={handleClose}
        product={product}
        visible
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByText("0")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Close quantity selector" }),
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
