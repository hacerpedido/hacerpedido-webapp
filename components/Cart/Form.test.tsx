import { useCart } from "#lib/context/CartContext";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Form from "./Form";

jest.mock("#lib/context/CartContext", () => ({
  useCart: jest.fn(),
}));

const mockUseCart = jest.mocked(useCart);

describe("Cart Form", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockClear();
    // The form only reads name/address/notes and the shop name; the rest of
    // the context value is out of contract for this mock.
    mockUseCart.mockReturnValue({
      dispatch,
      state: { address: "", name: "", notes: "", shop: { name: "La Esquina" } },
    } as unknown as ReturnType<typeof useCart>);
  });

  test("renders delivery fields and the shop-specific submit action", () => {
    render(<Form onSubmit={jest.fn()} />);

    expect(screen.getByLabelText("Tu Nombre")).toBeTruthy();
    expect(screen.getByLabelText("Tu Dirección")).toBeTruthy();
    expect(screen.getByLabelText("Notas")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Submit WhatsApp order" }).textContent,
    ).toContain("Pedir a La Esquina");
  });

  test("dispatches edited customer fields", () => {
    render(<Form onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByTestId("customer-name"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByTestId("customer-address"), {
      target: { value: "Calle 123" },
    });
    fireEvent.change(screen.getByTestId("order-notes"), {
      target: { value: "Sin cebolla" },
    });

    expect(dispatch).toHaveBeenCalledWith({ payload: "Ana", type: "SET_NAME" });
    expect(dispatch).toHaveBeenCalledWith({
      payload: "Calle 123",
      type: "SET_ADDRESS",
    });
    expect(dispatch).toHaveBeenCalledWith({
      payload: "Sin cebolla",
      type: "SET_NOTES",
    });
  });

  test("hides the address field in takeaway mode", () => {
    render(<Form onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByLabelText("Cambiar entre delivery y takeaway"));

    expect(screen.queryByTestId("customer-address")).toBeNull();
  });

  test("requires a customer name and address before submitting delivery order", async () => {
    const onSubmit = jest.fn();
    render(<Form onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Submit WhatsApp order" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Necesitamos tu nombre")).toBeTruthy();
      expect(screen.getByText("Necesitamos tu dirección")).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
