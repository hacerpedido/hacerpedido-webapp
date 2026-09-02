// @ts-nocheck
import React, { useCallback, useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "react-drop-zone/dist/styles.css";
import axios from "axios";
import dynamic from "next/dynamic";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styles from "./UploadImage.module.css";

const DynamicStyledDropZone = dynamic(
  () => import("react-drop-zone").then((mod) => mod.StyledDropZone),
  {
    ssr: false,
  },
);

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio =
  (typeof window !== "undefined" && window.devicePixelRatio) || 1;

const UploadImage = ({ shopID, imageType, handleClose }) => {
  const circularCrop = imageType === "logo";
  const aspect = imageType === "logo" ? 1 : 1.2014;

  const [image, setImage] = useState(undefined);
  const [isWaiting, setWaiting] = useState(false);
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, aspect: aspect });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onDropFile = (e) => {
    if (e) {
      setImage(e);
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      reader.readAsDataURL(e);
    }
  };

  const onDelete = () => {
    const data = new FormData();

    data.append("shop_id", shopID);
    data.append("image_type", imageType);

    setWaiting(true);
    axios
      .delete(`${window.location.origin}/api/images`, {
        data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setWaiting(false);
        handleClose({ forceRefresh: true });
      });
  };

  const onUpload = (crop) => {
    if (!crop) {
      return;
    }

    setWaiting(true);

    const data = new FormData();
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    canvas.toBlob(
      (blob) => {
        data.append("image", blob);
        data.append("shop_id", shopID);
        data.append("image_type", imageType);

        axios
          .post(`${window.location.origin}/api/images`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(() => {
            setWaiting(false);
            handleClose({ forceRefresh: true });
          });
      },
      "image/png",
      1,
    );
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Sube una imagen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.uploaderContainer}>
          {!image && typeof window !== "undefined" && (
            <DynamicStyledDropZone
              accept="image/*"
              children="Haga click o arrastre un archivo aquí"
              multiple={false}
              onDrop={onDropFile}
            />
          )}
          {image && (
            <div className={styles.preview}>
              <ReactCrop
                circularCrop={circularCrop}
                crop={crop}
                onChange={(nextCrop) => setCrop(nextCrop)}
                onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
                onImageLoaded={onLoad}
                src={upImg}
              />
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer
        className={`${styles.footer} ${!image ? styles.footerEmpty : ""}`}
      >
        {isWaiting && (
          <div className={styles.waiting} role="status">
            <span>Por favor, espere... </span>
            <span aria-label="Cargando" className={styles.spinner} />
          </div>
        )}
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
      </Modal.Footer>
    </>
  );
};

export default UploadImage;
