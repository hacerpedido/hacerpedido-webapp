import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
// import { StyledDropZone } from "react-drop-zone";
import "react-drop-zone/dist/styles.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import dynamic from 'next/dynamic'

import theme from "../../assets/theme";

const DynamicStyledDropZone = dynamic(() =>
  import('react-drop-zone').then((mod) => mod.StyledDropZone),
  { ssr: false }
)

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio =
  (typeof window !== "undefined" && window.devicePixelRatio) || 1;

const UploadImage = ({ handleClose }) => {
  const [image, setImage] = useState(undefined);

  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onDropFile = (e) => {
    if (e) {
      setImage(e);
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      reader.readAsDataURL(e);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
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
      crop.height
    );
  }, [completedCrop]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Sube una imagen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <View style={styles.uploaderContainer}>
          {!image && typeof window !== "undefined" && (
            <DynamicStyledDropZone
              accept="image/*"
              children={"Haga click o arrastre un archivo aquí"}
              onDrop={onDropFile}
              multiple={false}
            />
          )}
          {image && (
            <View>
              <View style={styles.preview}>
                <ReactCrop
                  src={upImg}
                  onImageLoaded={onLoad}
                  circularCrop={true}
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                />
                {/* <canvas
                ref={previewCanvasRef}
                // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                style={{
                  width: Math.round(completedCrop?.width ?? 0),
                  height: Math.round(completedCrop?.height ?? 0),
                }}
              /> */}
              </View>

              {/* <button
                type="button"
                disabled={!completedCrop?.width || !completedCrop?.height}
                onClick={() =>
                  generateDownload(previewCanvasRef.current, completedCrop)
                }
              >
                Download cropped image
              </button> */}
            </View>
          )}
        </View>
      </Modal.Body>
      <Modal.Footer>
        {image && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Descartar
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Aceptar
            </Button>
          </>
        )}
        {!image && (
          <Button variant="primary" onClick={handleClose}>
            Cancelar
          </Button>
        )}
      </Modal.Footer>
    </>
  );
};

// We resize the canvas down when saving on retina devices otherwise the image
// will be double or triple the preview size.
// function getResizedCanvas(canvas, newWidth, newHeight) {
//   const tmpCanvas = document.createElement("canvas");
//   tmpCanvas.width = newWidth;
//   tmpCanvas.height = newHeight;

//   const ctx = tmpCanvas.getContext("2d");
//   ctx.drawImage(
//     canvas,
//     0,
//     0,
//     canvas.width,
//     canvas.height,
//     0,
//     0,
//     newWidth,
//     newHeight
//   );

//   return tmpCanvas;
// }

// function generateDownload(previewCanvas, crop) {
//   if (!crop || !previewCanvas) {
//     return;
//   }

//   const canvas = getResizedCanvas(previewCanvas, crop.width, crop.height);

//   canvas.toBlob(
//     (blob) => {
//       const previewUrl = window.URL.createObjectURL(blob);

//       const anchor = document.createElement("a");
//       anchor.download = "cropPreview.png";
//       anchor.href = URL.createObjectURL(blob);
//       anchor.click();

//       window.URL.revokeObjectURL(previewUrl);
//     },
//     "image/png",
//     1
//   );
// }

export default UploadImage;

const styles = StyleSheet.create({
  containerView: {
    backgroundColor: theme.colors.lightBackground,
    borderColor: theme.colors.gray2,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
    flexDirection: "column",
    margin: 50,
    padding: 20,
  },
  preview: {
    alignItems: "center",
    backgroundColor: theme.colors.gray4,
    justifyContent: "center",
    maxHeight: "75vh",
    overflow: "scroll",
  },
  textClose: {
    borderRadius: 5,
    color: theme.colors.black,
    fontSize: "1.5em",
    textAlign: "center",
    width: 60,
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
  titleView: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploaderContainer: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray2,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
    // minHeight: 400,
    // minWidth: 600,
  },
});
