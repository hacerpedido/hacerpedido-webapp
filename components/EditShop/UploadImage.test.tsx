// @ts-nocheck — see components/primitivas/Button.test.tsx for the same rationale.
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import UploadImage from "./UploadImage";

expect.extend(toHaveNoViolations);

// `react-image-crop@11` ships its CSS via the same path that the source
// imports. Empty mock so Jest doesn't try to resolve the stylesheet.
jest.mock("react-image-crop/dist/ReactCrop.css", () => ({}));

// `react-dropzone@20` exposes a `useDropzone` hook that returns a tuple
// of helpers (`getRootProps`, `getInputProps`, `isDragActive`). The SUT
// only consumes `getRootProps`/`getInputProps`; provide them as plain
// pass-throughs so the wrapper renders the same internal <input>.
jest.mock("react-dropzone", () => {
  const React = require("react") as typeof import("react");

  const useDropzone = (options: { onDrop?: (files: File[]) => void } = {}) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    return {
      getRootProps: (overrides: Record<string, unknown> = {}) => ({
        tabIndex: 0,
        role: "button",
        ...overrides,
      }),
      getInputProps: (overrides: Record<string, unknown> = {}) => ({
        ref: inputRef,
        type: "file",
        style: { display: "none" },
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            options.onDrop?.(Array.from(files));
          } else {
            options.onDrop?.([]);
          }
        },
        "aria-label": "Seleccionar imagen",
        ...overrides,
      }),
      isDragActive: false,
    };
  };

  return { useDropzone };
});

// After issue #133's migration (EditShop side), `UploadImage` no longer
// imports `react-bootstrap` for its modal/buttons. Throw on import if
// anything regresses so we catch it loudly.
jest.mock(
  "react-bootstrap/Modal",
  () => {
    throw new Error(
      "react-bootstrap/Modal must no longer be imported from UploadImage (issue #235 migration).",
    );
  },
  { virtual: true },
);
jest.mock(
  "react-bootstrap/Button",
  () => {
    throw new Error(
      "react-bootstrap/Button must no longer be imported from UploadImage (issue #235 migration).",
    );
  },
  { virtual: true },
);

// `react-image-crop@11`'s `ReactCrop` takes `crop`, `aspect`, and
// `circularCrop` at the top level, renders the source image via
// children, and fires `onChange(pixelCrop, percentCrop)` /
// `onComplete(pixelCrop | null, percentCrop)` callbacks. Mock it as a
// small element so the SUT's child <img> still renders, and so the
// existing `Cambiar recorte` / `Quitar recorte` buttons keep working
// through the new (pixel, percent) callback shape.
jest.mock("react-image-crop", () => {
  const mockReact = require("react") as typeof import("react");

  type MockCrop = {
    x: number;
    y: number;
    width: number;
    height: number;
    unit: "px" | "%";
  };

  const mockCropWithUnit = (
    x: number,
    y: number,
    width: number,
    height: number,
    unit: "px" | "%",
  ): MockCrop => ({
    x,
    y,
    width,
    height,
    unit,
  });

  const mockReactCrop = (props: {
    aspect?: number;
    children?: React.ReactNode;
    circularCrop?: boolean;
    crop?: MockCrop | undefined;
    onChange: (pixelCrop: MockCrop, percentCrop: MockCrop) => void;
    onComplete?: (pixelCrop: MockCrop | null, percentCrop: MockCrop) => void;
  }) => {
    mockReact.useEffect(() => {
      // Seed the SUT's `crop` state with a sensible default so the first
      // `Aceptar` click has a non-null `completedCrop` to upload with.
      const init = mockCropWithUnit(10, 5, 100, 80, "px");
      const initPercent = mockCropWithUnit(10, 5, 100, 80, "%");
      props.onChange?.(init, initPercent);
      props.onComplete?.(init, initPercent);
    }, []);
    return (
      <div data-testid="cropper">
        {props.children}
        <output data-testid="crop">{JSON.stringify(props.crop)}</output>
        <button
          onClick={() => {
            const nextPercent = mockCropWithUnit(10, 5, 100, 80, "%");
            const nextPixel = mockCropWithUnit(10, 5, 100, 80, "px");
            props.onChange(nextPixel, nextPercent);
            props.onComplete?.(nextPixel, nextPercent);
          }}
          type="button"
        >
          Cambiar recorte
        </button>
        <button
          onClick={() =>
            props.onComplete?.(null, mockCropWithUnit(0, 0, 0, 0, "%"))
          }
          type="button"
        >
          Quitar recorte
        </button>
      </div>
    );
  };

  return { __esModule: true, default: mockReactCrop };
});

describe("UploadImage", () => {
  const handleClose = jest.fn();
  const fetchMock = jest.fn();
  let context: { drawImage: jest.Mock; setTransform: jest.Mock };

  beforeEach(() => {
    handleClose.mockClear();
    fetchMock.mockReset();
    global.fetch = fetchMock;
    context = {
      drawImage: jest.fn(),
      setTransform: jest.fn(),
    };
    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context as unknown as CanvasRenderingContext2D | null);
    jest
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((callback) => callback(new Blob(["image"])));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderUploader = (imageType: "logo" | "background" = "logo") =>
    render(
      <UploadImage
        handleClose={handleClose}
        imageType={imageType}
        shopID={7}
      />,
    );

  const selectFile = async () => {
    const file = new File(["image"], "logo.png", { type: "image/png" });
    const input = screen.getByLabelText("Seleccionar imagen");
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(await screen.findByTestId("cropper")).toBeTruthy();
  };

  test("renders the drop zone until a file is selected", () => {
    renderUploader();
    expect(screen.getByLabelText("Seleccionar imagen")).toBeTruthy();
    expect(screen.queryByTestId("drop-zone")).toBeTruthy();
    expect(screen.queryByTestId("cropper")).toBeNull();
  });

  test("renders a preview, changes the crop, and uploads successfully", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    renderUploader("background");
    await selectFile();

    expect(screen.getByAltText("Vista previa")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cambiar recorte" }));
    expect(screen.getByTestId("crop").textContent).toContain('"width":100');

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() =>
      expect(handleClose).toHaveBeenCalledWith({ forceRefresh: true }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/api/images`,
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    const uploadRequest = fetchMock.mock.calls[0][1];
    expect(uploadRequest.headers).toBeUndefined();
    expect(uploadRequest.body.get("image_type")).toBe("background");
    expect(uploadRequest.body.get("shop_id")).toBe("7");
    expect(uploadRequest.body.get("image")).toBeTruthy();
    expect(context.drawImage).toHaveBeenCalled();
  });

  test("does not upload when the crop is invalid", async () => {
    renderUploader();
    await selectFile();

    fireEvent.click(screen.getByRole("button", { name: "Quitar recorte" }));
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("cropper")).toBeTruthy();
  });

  test("shows upload errors and stops loading", async () => {
    let rejectUpload!: (reason?: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectUpload = reject;
        }),
    );
    renderUploader();
    await selectFile();
    // Click Cambiar recorte first so the SUT's Aceptar click handler
    // captures a fresh closure with `completedCrop` populated; the mock's
    // initial seed runs in a useEffect so the first click after mount
    // would otherwise land against a stale closure.
    fireEvent.click(screen.getByRole("button", { name: "Cambiar recorte" }));

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(screen.getByText("Por favor, espere...")).toBeTruthy();
    rejectUpload(new Error("upload failed"));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "No se pudo subir la imagen",
      ),
    );
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeTruthy();
  });

  test("shows upload errors for non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    renderUploader();
    await selectFile();
    fireEvent.click(screen.getByRole("button", { name: "Cambiar recorte" }));
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "No se pudo subir la imagen",
      ),
    );
    expect(handleClose).not.toHaveBeenCalled();
  });

  test("deletes the current image successfully", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    renderUploader();

    fireEvent.click(
      screen.getByRole("button", { name: "Borrar imagen actual" }),
    );

    await waitFor(() =>
      expect(handleClose).toHaveBeenCalledWith({ forceRefresh: true }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/api/images`,
      expect.objectContaining({
        method: "DELETE",
        body: expect.any(FormData),
      }),
    );
    const deleteRequest = fetchMock.mock.calls[0][1];
    expect(deleteRequest.headers).toBeUndefined();
    expect(deleteRequest.body.get("image_type")).toBe("logo");
    expect(deleteRequest.body.get("shop_id")).toBe("7");
  });

  test("shows delete errors and stops loading", async () => {
    let rejectDelete!: (reason?: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectDelete = reject;
        }),
    );
    renderUploader();

    fireEvent.click(
      screen.getByRole("button", { name: "Borrar imagen actual" }),
    );

    expect(screen.getByText("Por favor, espere...")).toBeTruthy();
    rejectDelete(new Error("delete failed"));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo borrar la imagen",
    );
    expect(handleClose).not.toHaveBeenCalled();
  });

  test("shows delete errors for non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    renderUploader();

    fireEvent.click(
      screen.getByRole("button", { name: "Borrar imagen actual" }),
    );

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo borrar la imagen",
    );
  });

  test("has no axe accessibility violations in the initial drop-zone state", async () => {
    const { container } = renderUploader();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("has no axe accessibility violations after a file is loaded", async () => {
    const { container } = renderUploader("background");
    await selectFile();
    expect(await axe(container)).toHaveNoViolations();
  });
});
