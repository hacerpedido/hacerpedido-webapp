// @ts-nocheck — see components/primitivas/Button.test.tsx for the same rationale.
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import type React from "react";
import EditShop from "./EditShop";

expect.extend(toHaveNoViolations);

type PhoneValidator = (value: string) => string | boolean;

type MockController = {
  name: string;
  rules?: unknown;
  [key: string]: unknown;
};

const mockControllers: Record<string, MockController> = {};

jest.mock("react-timeago", () => ({
  __esModule: true,
  default: ({ date }: { date: unknown }) => (
    <span data-testid="time-ago">{String(date)}</span>
  ),
}));

jest.mock("react-hook-form", () => ({
  Controller: ({
    defaultValue,
    name,
    render,
    rules,
  }: {
    defaultValue: unknown;
    name: string;
    render: (props: {
      field: {
        name: string;
        onBlur: () => void;
        onChange: () => void;
        ref: () => void;
        value: unknown;
      };
    }) => React.ReactNode;
    rules?: unknown;
  }) => {
    mockControllers[name] = { name, rules };
    return render({
      field: {
        name,
        onBlur: jest.fn(),
        onChange: jest.fn(),
        ref: jest.fn(),
        value: defaultValue,
      },
    });
  },
}));

jest.mock(
  "react-bootstrap/Modal",
  () => {
    throw new Error(
      "react-bootstrap/Modal must no longer be imported after the EditShop migration to the native Dialog wrapper (issue #133 PR 3).",
    );
  },
  { virtual: true },
);

jest.mock(
  "./UploadImage",
  () =>
    ({
      handleClose,
      imageType,
      token,
    }: {
      handleClose: (options: { forceRefresh: boolean }) => void;
      imageType: string;
      token: string;
    }) => (
      <div data-testid="upload-image" data-token={token}>
        Editando {imageType}
        <button
          onClick={() => handleClose({ forceRefresh: true })}
          type="button"
        >
          Confirmar imagen
        </button>
      </div>
    ),
);

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

  const renderEditor = (overrides: Record<string, unknown> = {}) => {
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
      token: "editor-token",
      ...overrides,
    };

    return { ...render(<EditShop {...props} />), props };
  };

  beforeEach(() => {
    for (const key of Object.keys(mockControllers)) {
      delete mockControllers[key];
    }
  });

  test("renders current shop values and saves successfully", () => {
    const { props } = renderEditor();

    expect(
      (screen.getByTestId("edit-shop-name") as HTMLInputElement).value,
    ).toBe("La Esquina");
    expect(
      (screen.getByTestId("edit-shop-address") as HTMLInputElement).value,
    ).toBe("Calle 123");

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
    const { rules } = mockControllers.orderswhatsappnumber as {
      rules: { validate: { matchesAtLeastAPhone: PhoneValidator } };
    };
    const validate = rules.validate.matchesAtLeastAPhone;

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

    expect(
      (screen.getByRole("button", { name: "Editar logo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Editar portada" }),
    ).toHaveProperty("disabled", true);
    expect(
      (screen.getByTestId("save-shop") as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByTestId("save-shop"));
    expect(props.onSave).not.toHaveBeenCalled();
  });

  test("opens the selected image editor and refreshes after closing it", () => {
    const { props } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Editar portada" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(screen.getByTestId("upload-image").textContent).toContain(
      "Editando background",
    );
    expect(screen.getByTestId("upload-image").getAttribute("data-token")).toBe(
      "editor-token",
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar imagen" }));
    expect(props.refresh).toHaveBeenCalledTimes(1);
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  test("has no axe accessibility violations in the default state", async () => {
    const { container } = renderEditor();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no axe accessibility violations while the image editor is open", async () => {
    const { container } = renderEditor();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Editar portada" }));
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
