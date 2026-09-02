import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import EditShop from "./EditShop";

const mockControllers = {};

jest.mock("react-timeago", () => ({
  __esModule: true,
  default: ({ date }) => <span data-testid="time-ago">{date}</span>,
}));

jest.mock("react-hook-form", () => ({
  Controller: ({ as: Component, control, defaultValue, rules, ...props }) => {
    mockControllers[props.name] = { ...props, rules };
    return <Component {...props} value={defaultValue} />;
  },
}));

jest.mock("react-bootstrap/Modal", () => {
  const Modal = ({ children, onHide, show }) =>
    show ? (
      <div role="dialog">
        {children}
        <button onClick={onHide} type="button">
          Cerrar modal
        </button>
      </div>
    ) : null;
  Modal.Header = ({ children }) => <div>{children}</div>;
  Modal.Title = ({ children }) => <h2>{children}</h2>;
  Modal.Body = ({ children }) => <div>{children}</div>;
  Modal.Footer = ({ children }) => <div>{children}</div>;
  return Modal;
});

jest.mock("./UploadImage", () => ({ handleClose, imageType }) => (
  <div data-testid="upload-image">
    Editando {imageType}
    <button onClick={() => handleClose({ forceRefresh: true })} type="button">
      Confirmar imagen
    </button>
  </div>
));

describe("EditShop", () => {
  const shop = {
    address: "Calle 123",
    deliverycost: "500",
    id: 7,
    name: "La Esquina",
    notes: "Cierra los lunes",
    opentimes: "9 a 18",
    ordersphonenumber: "2230000000",
    orderswhatsappnumber: "",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  const renderEditor = (overrides = {}) => {
    const props = {
      control: {},
      errors: {},
      getValues: () => ({
        ordersphonenumber: shop.ordersphonenumber,
        orderswhatsappnumber: shop.orderswhatsappnumber,
      }),
      handleSubmit: jest.fn(),
      isSaving: false,
      onSave: jest.fn(),
      refresh: jest.fn(),
      shop,
      ...overrides,
    };

    return { ...render(<EditShop {...props} />), props };
  };

  beforeEach(() => {
    Object.keys(mockControllers).forEach((key) => delete mockControllers[key]);
  });

  test("renders current shop values and saves successfully", () => {
    const { props } = renderEditor();

    expect(screen.getByTestId("edit-shop-name").value).toBe("La Esquina");
    expect(screen.getByTestId("edit-shop-address").value).toBe("Calle 123");

    fireEvent.click(screen.getByTestId("save-shop"));

    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["missing", undefined],
    ["null", null],
    ["malformed", "not-a-date"],
  ])(
    "does not render relative time for %s updated_at",
    (_label, updated_at) => {
      renderEditor({ shop: { ...shop, updated_at } });

      expect(screen.queryByTestId("time-ago")).toBeNull();
      expect(screen.queryByText(/Actualizado/)).toBeNull();
    },
  );

  test("passes a valid updated_at timestamp and preserves Spanish copy", () => {
    renderEditor();

    expect(screen.getByText(/Actualizado/)).toBeTruthy();
    expect(screen.getByTestId("time-ago").textContent).toBe(
      String(Date.parse(shop.updated_at)),
    );
  });

  test("renders validation errors and exposes phone validation rules", () => {
    const error = { message: "El nombre del comercio es requerido." };
    const { props } = renderEditor({
      errors: { name: error },
      getValues: () => ({ ordersphonenumber: "", orderswhatsappnumber: "" }),
    });

    expect(screen.getByText(error.message)).toBeTruthy();
    const validate =
      mockControllers.orderswhatsappnumber.rules.validate.matchesAtLeastAPhone;

    expect(validate("")).toBe(
      "Al menos un número de teléfono debe ser ingresado.",
    );
    expect(validate("invalid")).toContain("No parece un número de teléfono");
    expect(validate("+5491155551 001")).toContain(
      "No parece un número de teléfono",
    );
    expect(validate("+5492230000000")).toBe(true);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  test("disables editing and saving while a save is pending", () => {
    const { props } = renderEditor({ isSaving: true });

    expect(screen.getByRole("button", { name: "Editar logo" }).disabled).toBe(
      true,
    );
    expect(
      screen.getByRole("button", { name: "Editar portada" }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByTestId("save-shop").disabled).toBe(true);

    fireEvent.click(screen.getByTestId("save-shop"));
    expect(props.onSave).not.toHaveBeenCalled();
  });

  test("opens the selected image editor and refreshes after closing it", () => {
    const { props } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Editar portada" }));
    expect(screen.getByTestId("upload-image").textContent).toContain(
      "Editando background",
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar imagen" }));
    expect(props.refresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("upload-image")).toBeNull();
  });
});
