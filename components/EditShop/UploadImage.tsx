"use client";

import Button from "#components/primitivas/Button";
import Dialog from "#components/primitivas/Dialog";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, { type PercentCrop, type PixelCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import styles from "./UploadImage.module.css";

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio =
  (typeof window !== "undefined" && window.devicePixelRatio) || 1;

type UploadImageType = "logo" | "background";

type UploadImageProps = {
  shopID: number;
  imageType: UploadImageType;
  handleClose: (options?: { forceRefresh?: boolean }) => void;
};

const UploadImage = ({ shopID, imageType, handleClose }: UploadImageProps) => {
  const circularCrop = imageType === "logo";
  const aspect = imageType === "logo" ? 1 : 1.2014;

  const [image, setImage] = useState<File | undefined>(undefined);
  const [isWaiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [upImg, setUpImg] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PercentCrop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }
    setError("");
    setImage(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setUpImg(reader.result as string);
    });
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  const onDelete = () => {
    const data = new FormData();
    data.append("shop_id", String(shopID));
    data.append("image_type", imageType);

    setError("");
    setWaiting(true);
    fetch(`${window.location.origin}/api/images`, {
      method: "DELETE",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Image deletion failed");
        }
      })
      .then(() => {
        setWaiting(false);
        handleClose({ forceRefresh: true });
      })
      .catch(() => {
        setWaiting(false);
        setError("No se pudo borrar la imagen. Intentá nuevamente.");
      });
  };

  const onUpload = (cropValue: PixelCrop | null) => {
    if (!cropValue) {
      return;
    }
    setError("");
    setWaiting(true);

    const data = new FormData();
    try {
      const imageEl = imgRef.current;
      if (!imageEl) {
        throw new Error("Image not loaded");
      }
      const scaleX = imageEl.naturalWidth / imageEl.width;
      const scaleY = imageEl.naturalHeight / imageEl.height;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas not supported");
      }
      canvas.width = cropValue.width * pixelRatio;
      canvas.height = cropValue.height * pixelRatio;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        imageEl,
        cropValue.x * scaleX,
        cropValue.y * scaleY,
        cropValue.width * scaleX,
        cropValue.height * scaleY,
        0,
        0,
        cropValue.width,
        cropValue.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setWaiting(false);
            setError("No se pudo preparar la imagen. Intentá nuevamente.");
            return;
          }
          data.append("image", blob);
          data.append("shop_id", String(shopID));
          data.append("image_type", imageType);

          fetch(`${window.location.origin}/api/images`, {
            method: "POST",
            body: data,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Image upload failed");
              }
            })
            .then(() => {
              setWaiting(false);
              handleClose({ forceRefresh: true });
            })
            .catch(() => {
              setWaiting(false);
              setError("No se pudo subir la imagen. Intentá nuevamente.");
            });
        },
        "image/png",
        1,
      );
    } catch {
      setWaiting(false);
      setError("No se pudo preparar la imagen. Intentá nuevamente.");
    }
  };

  const onChangeHandler = useCallback(
    (_pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setCrop(percentCrop);
    },
    [],
  );

  const onCompleteHandler = useCallback(
    (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      void percentCrop;
      setCompletedCrop(pixelCrop);
    },
    [],
  );

  return (
    <>
      <Dialog.Title>Sube una imagen</Dialog.Title>
      <Dialog.Body>
        <div className={styles.uploaderContainer}>
          {!image && (
            <div
              {...getRootProps()}
              className={styles.dropZone}
              data-testid="drop-zone"
            >
              <input {...getInputProps()} />
              <p>
                {isDragActive
                  ? "Soltá la imagen aquí…"
                  : "Haga click o arrastre un archivo aquí"}
              </p>
            </div>
          )}
          {image && upImg && (
            <div className={styles.preview}>
              <ReactCrop
                aspect={aspect}
                circularCrop={circularCrop}
                crop={crop}
                onChange={onChangeHandler}
                onComplete={onCompleteHandler}
              >
                {/* biome-ignore lint/performance/noImgElement: This is a direct image-of-source-image rendering for the cropper. */}
                <img alt="Vista previa" ref={imgRef} src={upImg} />
              </ReactCrop>
            </div>
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer
        className={`${styles.footer} ${!image ? styles.footerEmpty : ""}`}
      >
        {isWaiting && (
          <div className={styles.waiting} role="status">
            <span>Por favor, espere... </span>
            <span aria-label="Cargando" className={styles.spinner} role="img" />
          </div>
        )}
        {error && <div role="alert">{error}</div>}
        {!isWaiting && image && (
          <Button onClick={() => onUpload(completedCrop)} variant="primary">
            Aceptar
          </Button>
        )}
        {!isWaiting && !image && (
          <Button onClick={onDelete} variant="primary">
            Borrar imagen actual
          </Button>
        )}
      </Dialog.Footer>
    </>
  );
};

export default UploadImage;
