// @ts-nocheck — see components/primitivas/Button.test.tsx for the same rationale.
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

// `next/link` schedules prefetch state updates after `render()` returns,
// surfacing React's "not wrapped in act(…)" warnings that the strict
// `tests/setup.ts` translates into test failures. Replace it with a plain
// anchor for tests — the link behaviour is exercised by Playwright E2E.
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

import HomeHeader from "./HomeHeader";

expect.extend(toHaveNoViolations);

// `next/link` triggers background prefetch behaviour that schedules React
// state updates after `render()` returns, surfacing Next.js's `LinkComponent`
// forwardRef in act() warnings when the strict test setup is active.
async function renderHome() {
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(<HomeHeader />);
  });
  return result;
}

describe("HomeHeader", () => {
  test("renders the trigger button with the Spanish '¡Sumá tu comercio!' label", async () => {
    await renderHome();
    expect(
      screen.queryByRole("button", { name: /Sumá tu comercio/i }),
    ).not.toBeNull();
  });

  test("opens the dialog when the trigger button is clicked", async () => {
    await renderHome();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Sumá tu comercio/i }),
      );
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.textContent).toContain("Ups...");
  });

  test("renders 'Cerrar' inside the dialog so the user can dismiss it", async () => {
    await renderHome();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Sumá tu comercio/i }),
      );
    });
    expect(screen.getByRole("dialog").textContent).toContain("Cerrar");
  });

  test("closes the dialog when a 'Cerrar' button is clicked", async () => {
    await renderHome();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Sumá tu comercio/i }),
      );
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    const closeButtons = screen.getAllByRole("button", { name: "Cerrar" });
    await act(async () => {
      fireEvent.click(closeButtons[0] ?? closeButtons[1]);
    });
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  test("has no axe accessibility violations in the default (closed) state", async () => {
    const { container } = await renderHome();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no axe accessibility violations when the dialog is open", async () => {
    const { container } = await renderHome();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Sumá tu comercio/i }),
      );
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
