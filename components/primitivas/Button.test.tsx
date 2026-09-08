import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Button from "./Button";

expect.extend(toHaveNoViolations);

describe("Button", () => {
  test("renders a native button by default with the accessible name from its text", () => {
    render(<Button>Aceptar</Button>);
    expect(screen.queryByRole("button", { name: "Aceptar" })).not.toBeNull();
  });

  test("uses type='button' by default to avoid accidental form submits", () => {
    render(<Button>Aceptar</Button>);
    expect(
      screen.getByRole("button", { name: "Aceptar" }).getAttribute("type"),
    ).toBe("button");
  });

  test("forwards type='submit' when provided", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(
      screen.getByRole("button", { name: "Enviar" }).getAttribute("type"),
    ).toBe("submit");
  });

  test("fires onClick on click", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Aceptar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("blocks click and exposes the disabled attribute when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Aceptar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Aceptar" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("forwards aria-label", () => {
    render(<Button aria-label="Cerrar">×</Button>);
    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeNull();
  });

  test("applies the primary variant class by default", () => {
    render(<Button>Aceptar</Button>);
    const button = screen.getByRole("button", { name: "Aceptar" });
    expect(button.className).toContain("primary");
  });

  test("applies the secondary variant class when variant='secondary'", () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(
      screen.getByRole("button", { name: "Cancelar" }).className,
    ).toContain("secondary");
  });

  test("applies the danger variant class when variant='danger'", () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(
      screen.getByRole("button", { name: "Eliminar" }).className,
    ).toContain("danger");
  });

  test("composes consumer className alongside the variant class", () => {
    render(<Button className="extra">Aceptar</Button>);
    const button = screen.getByRole("button", { name: "Aceptar" });
    expect(button.className).toContain("primary");
    expect(button.className).toContain("extra");
  });

  test("has no axe accessibility violations", async () => {
    const { container } = render(<Button>Aceptar</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
