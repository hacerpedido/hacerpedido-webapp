import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditProducts from "./EditProducts";

type ChangeRow = [number, number, unknown, unknown];

type HotCell = {
  renderer?: (...args: unknown[]) => void;
};

type HotSettings = {
  cells?: (row: number, col: number) => HotCell;
};

type HotTableInstance = {
  getData: () => unknown;
  getDataAtRow: (row: number) => unknown;
  updateSettings: (settings: unknown) => void;
};

jest.mock("handsontable/styles/handsontable.min.css", () => ({}));
jest.mock("handsontable/styles/ht-theme-main.min.css", () => ({}));

jest.mock("#lib/hooks/use_width", () => jest.fn());

jest.mock("next/dynamic", () => {
  const React = require("react") as typeof import("react");

  return {
    __esModule: true,
    default: () =>
      function MockHotTable({
        afterChange,
        beforeChange,
        data,
        forwardedRef,
      }: {
        afterChange: (changes: ChangeRow[]) => void;
        beforeChange: (changes: ChangeRow[], source: string) => void;
        data: unknown;
        forwardedRef: { current: { hotInstance: HotTableInstance } | null };
      }) {
        const [pastedChanges, setPastedChanges] = React.useState<
          ChangeRow[] | null
        >(null);
        const [renderedStyle, setRenderedStyle] = React.useState<Record<
          string,
          string
        > | null>(null);
        const settings = React.useRef<HotSettings>({});
        const dataRef = React.useRef(data);
        const hotInstance: HotTableInstance = {
          getData: () => dataRef.current,
          getDataAtRow: (row) => (dataRef.current as unknown[])[row],
          updateSettings: (nextSettings) => {
            settings.current = nextSettings as HotSettings;
          },
        };
        forwardedRef.current = { hotInstance };

        return (
          <div data-testid="hot-table">
            <output data-testid="grid-data">{JSON.stringify(data)}</output>
            <output data-testid="pasted-changes">
              {JSON.stringify(pastedChanges)}
            </output>
            <output data-testid="renderer-style">
              {JSON.stringify(renderedStyle)}
            </output>
            <button
              onClick={() => {
                const changes: ChangeRow[] = [
                  [1, 0, false, "TRUE"],
                  [3, 3, "old", "$1.234"],
                ];
                beforeChange(changes, "CopyPaste.paste");
                setPastedChanges(changes);
                afterChange(changes);
              }}
              type="button"
            >
              Pegar datos
            </button>
            <button
              onClick={() => {
                const cell = settings.current.cells?.(1, 1);
                const td = { style: {} as Record<string, string> };
                if (cell) {
                  cell.renderer?.(
                    {} as object,
                    td,
                    1,
                    1,
                    "name",
                    "Pizzas",
                    cell,
                  );
                  setRenderedStyle(td.style);
                }
              }}
              type="button"
            >
              Aplicar renderer
            </button>
          </div>
        );
      },
  };
});

describe("EditProducts", () => {
  const products = [
    {
      category: "Pizzas",
      description: "Grande",
      id: 1,
      name: "Muzzarella",
      price: "1200",
      shopid: 7,
    },
  ];

  test("renders the editable menu grid", async () => {
    render(
      <EditProducts
        onTempProductsChange={jest.fn()}
        products={products}
        shopId={7}
      />,
    );

    expect(await screen.findByTestId("hot-table")).toBeTruthy();
    expect(screen.getByTestId("grid-data").textContent).toContain(
      '[[false,"","",""]',
    );
    expect(screen.getByTestId("grid-data").textContent).toContain("Pizzas");
  });

  test("normalizes pasted categories and prices before reporting edits", async () => {
    const onTempProductsChange = jest.fn();
    render(
      <EditProducts
        onTempProductsChange={onTempProductsChange}
        products={products}
        shopId={7}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Pegar datos" }));

    expect(screen.getByTestId("pasted-changes").textContent).toContain("true");
    expect(screen.getByTestId("pasted-changes").textContent).toContain("1234");
    expect(onTempProductsChange).toHaveBeenCalledWith([
      {
        category: "Pizzas",
        description: "Grande",
        itemnumber: 1,
        name: "Muzzarella",
        price: "1200",
        shopid: "7",
      },
    ]);
  });

  test("configures category cells with the renderer and read-only fields", async () => {
    render(
      <EditProducts
        onTempProductsChange={jest.fn()}
        products={products}
        shopId={7}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Aplicar renderer" }),
    );

    await waitFor(() =>
      expect(
        JSON.parse(screen.getByTestId("renderer-style").textContent),
      ).toEqual({ fontWeight: "bold" }),
    );
  });
});
