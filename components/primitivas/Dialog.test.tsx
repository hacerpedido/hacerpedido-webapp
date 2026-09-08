import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { useState } from "react";
import Dialog from "./Dialog";

expect.extend(toHaveNoViolations);

describe("Dialog", () => {
  test("renders nothing 'open' when closed", () => {
    const { container } = render(
      <Dialog ariaLabel="Prueba" open={false}>
        cuerpo
      </Dialog>,
    );
    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  test("renders with role=dialog and aria-modal=true when open", () => {
    render(
      <Dialog open titleId="t-1">
        <Dialog.Title id="t-1">Confirmación</Dialog.Title>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("t-1");
  });

  test("uses aria-label when provided and no titleId is given", () => {
    render(
      <Dialog ariaLabel="Confirmación" open>
        cuerpo
      </Dialog>,
    );
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe(
      "Confirmación",
    );
  });

  test("falls back to a visually hidden heading so aria-labelledby still wires up", () => {
    const { container } = render(<Dialog open>cuerpo</Dialog>);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).not.toBeNull();
    expect(container.querySelector(`#${labelledBy}`)).not.toBeNull();
  });

  test("renders the close button by default with the Spanish accessible name 'Cerrar'", () => {
    render(
      <Dialog open>
        <Dialog.Title>Título</Dialog.Title>
      </Dialog>,
    );
    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeNull();
  });

  test("honours a custom closeLabel", () => {
    render(
      <Dialog closeLabel="Close" open>
        <Dialog.Title>Title</Dialog.Title>
      </Dialog>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeNull();
  });

  test("hides the close button when hideCloseButton is true", () => {
    render(
      <Dialog hideCloseButton open>
        <Dialog.Title>Título</Dialog.Title>
      </Dialog>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("closes the dialog when the consumer flips `open` to false after onClose", () => {
    const Parent = () => {
      const [open, setOpen] = useState(true);
      return (
        <Dialog onClose={() => setOpen(false)} open={open}>
          <Dialog.Title>Título</Dialog.Title>
          <Dialog.Body>cuerpo</Dialog.Body>
        </Dialog>
      );
    };
    render(<Parent />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  test("fires onClose when the dialog emits a close event", () => {
    const onClose = jest.fn();
    render(
      <Dialog onClose={onClose} open>
        <Dialog.Title>Título</Dialog.Title>
      </Dialog>,
    );
    fireEvent(screen.getByRole("dialog"), new Event("close"));
    expect(onClose).toHaveBeenCalled();
  });

  test("wires aria-describedby to the descriptionId prop", () => {
    render(
      <Dialog descriptionId="d" open titleId="t">
        <Dialog.Title id="t">Título</Dialog.Title>
        <Dialog.Description id="d">Descripción</Dialog.Description>
      </Dialog>,
    );
    expect(screen.getByRole("dialog").getAttribute("aria-describedby")).toBe(
      "d",
    );
  });

  test("has no axe accessibility violations when properly labelled", async () => {
    const { container } = render(
      <Dialog open titleId="t">
        <Dialog.Title id="t">Confirmación</Dialog.Title>
        <Dialog.Body>¿Estás seguro?</Dialog.Body>
        <Dialog.Footer>
          <button type="button">Cancelar</button>
          <button type="button">Aceptar</button>
        </Dialog.Footer>
      </Dialog>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
