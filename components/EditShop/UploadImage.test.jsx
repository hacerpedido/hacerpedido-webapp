import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import UploadImage from "./UploadImage";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("react-image-crop/dist/ReactCrop.css", () => ({}));
jest.mock("react-drop-zone/dist/styles.css", () => ({}));

jest.mock("react-image-crop", () => {
  const React = require("react");

  return function MockReactCrop({
    crop,
    onChange,
    onComplete,
    onImageLoaded,
    src,
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
    StyledDropZone: ({ onDrop }) => (
      <div>
        <input
          aria-label="Seleccionar imagen"
          onChange={(event) => onDrop(event.target.files?.[0])}
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
  default: (loader) => {
    const DropZone = require("react-drop-zone").StyledDropZone;
    void loader;
    return (props) => <DropZone {...props} />;
  },
}));

jest.mock("react-bootstrap/Modal", () => {
  const Modal = ({ children }) => <div role="dialog">{children}</div>;
  Modal.Header = ({ children }) => <div>{children}</div>;
  Modal.Title = ({ children }) => <h2>{children}</h2>;
  Modal.Body = ({ children }) => <div>{children}</div>;
  Modal.Footer = ({ children }) => <div>{children}</div>;
  return Modal;
});

jest.mock("react-bootstrap/Button", () => {
  return ({ children, ...props }) => <button {...props}>{children}</button>;
});

describe("UploadImage", () => {
  const handleClose = jest.fn();
  let context;

  beforeEach(() => {
    handleClose.mockClear();
    axios.delete.mockReset();
    axios.post.mockReset();
    context = {
      drawImage: jest.fn(),
      setTransform: jest.fn(),
    };
    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context);
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
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    renderUploader("background");
    await selectFile();

    expect(screen.getByAltText("Vista previa")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cambiar recorte" }));
    expect(screen.getByTestId("crop").textContent).toContain('"width":100');

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    await waitFor(() =>
      expect(handleClose).toHaveBeenCalledWith({ forceRefresh: true }),
    );
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/images"),
      expect.any(FormData),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(context.drawImage).toHaveBeenCalled();
  });

  test("does not upload when the crop is invalid", async () => {
    renderUploader();
    await selectFile();

    fireEvent.click(screen.getByRole("button", { name: "Quitar recorte" }));
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByTestId("cropper")).toBeTruthy();
  });

  test("shows upload errors and stops loading", async () => {
    let rejectUpload;
    axios.post.mockImplementationOnce(
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

  test("deletes the current image successfully", async () => {
    axios.delete.mockResolvedValueOnce({ data: { ok: true } });
    renderUploader();

    fireEvent.click(
      screen.getByRole("button", { name: "Borrar imagen actual" }),
    );

    await waitFor(() =>
      expect(handleClose).toHaveBeenCalledWith({ forceRefresh: true }),
    );
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining("/api/images"),
      expect.objectContaining({ data: expect.any(FormData) }),
    );
  });

  test("shows delete errors and stops loading", async () => {
    let rejectDelete;
    axios.delete.mockImplementationOnce(
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
});
