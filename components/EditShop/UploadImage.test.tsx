import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import UploadImage from "./UploadImage";

type CropShape = { x: number; y: number; width: number; height: number };
type LoadedImage = {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
};

jest.mock("react-image-crop/dist/ReactCrop.css", () => ({}));
jest.mock("react-drop-zone/dist/styles.css", () => ({}));

jest.mock("react-image-crop", () => {
  const React = require("react") as typeof import("react");

  return function MockReactCrop({
    crop,
    onChange,
    onComplete,
    onImageLoaded,
    src,
  }: {
    crop: CropShape | null;
    onChange: (crop: CropShape) => void;
    onComplete: (crop: CropShape | null) => void;
    onImageLoaded: (image: LoadedImage) => void;
    src: string;
  }) {
    React.useEffect(() => {
      onImageLoaded({
        naturalWidth: 400,
        naturalHeight: 300,
        width: 200,
        height: 150,
      });
      onComplete(crop);
    }, []);

    return (
      <div data-testid="cropper">
        {/* biome-ignore lint/performance/noImgElement: This is a lightweight image mock for the crop component. */}
        <img alt="Vista previa" src={src} />
        <output data-testid="crop">{JSON.stringify(crop)}</output>
        <button
          onClick={() => {
            const nextCrop = { height: 80, width: 100, x: 10, y: 5 };
            onChange(nextCrop);
            onComplete(nextCrop);
          }}
          type="button"
        >
          Cambiar recorte
        </button>
        <button onClick={() => onComplete(null)} type="button">
          Quitar recorte
        </button>
      </div>
    );
  };
});

jest.mock("react-drop-zone", () => {
  return {
    StyledDropZone: ({ onDrop }: { onDrop: (file: File | null) => void }) => (
      <div>
        <input
          aria-label="Seleccionar imagen"
          onChange={(event) => onDrop(event.target.files?.[0] ?? null)}
          type="file"
        />
        <button onClick={() => onDrop(null)} type="button">
          Rechazar archivo
        </button>
      </div>
    ),
  };
});

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: unknown) => {
    const DropZone = (
      require("react-drop-zone") as {
        StyledDropZone: React.ComponentType<Record<string, unknown>>;
      }
    ).StyledDropZone;
    void loader;
    return (props: Record<string, unknown>) => <DropZone {...props} />;
  },
}));

jest.mock("react-bootstrap/Modal", () => {
  const Modal = ({ children }: { children?: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  );

  return Object.assign(Modal, {
    Header: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Title: ({ children }: { children?: React.ReactNode }) => (
      <h2>{children}</h2>
    ),
    Body: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Footer: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
  });
});

jest.mock("react-bootstrap/Button", () => {
  return ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>;
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

  const renderUploader = (imageType = "logo") =>
    render(
      <UploadImage
        handleClose={handleClose}
        imageType={imageType}
        shopID={7}
      />,
    );

  const selectFile = async () => {
    const file = new File(["image"], "logo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Seleccionar imagen"), {
      target: { files: [file] },
    });
    expect(await screen.findByTestId("cropper")).toBeTruthy();
  };

  test("keeps the drop zone visible when a file is rejected", () => {
    renderUploader();

    fireEvent.click(screen.getByRole("button", { name: "Rechazar archivo" }));

    expect(screen.getByLabelText("Seleccionar imagen")).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(screen.getByText("Por favor, espere...")).toBeTruthy();
    rejectUpload(new Error("upload failed"));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo subir la imagen",
    );
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeTruthy();
  });

  test("shows upload errors for non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    renderUploader();
    await selectFile();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo subir la imagen",
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
    expect(handleClose).not.toHaveBeenCalled();
  });
});
