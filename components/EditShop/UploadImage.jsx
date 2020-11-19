import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  // ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
// import { Controller } from "react-hook-form";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { StyledDropZone } from "react-drop-zone";
import "react-drop-zone/dist/styles.css";

// import Input from "../components/ShopInput";
import theme from "../../assets/theme";

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio = window.devicePixelRatio || 1;

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

export default ({ onCloseModal }) => {
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
    <View style={styles.containerView}>
      <View style={styles.titleView}>
        <Text style={styles.title}>Sube una imagen</Text>
        <TouchableHighlight onPress={onCloseModal}>
          <Text style={styles.textClose}>x</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.uploaderContainer}>
        {!image && (
          <StyledDropZone
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
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                underlayColor={"none"}
                onPress={onCloseModal}
                style={styles.buttonBase}
              >
                <Text style={styles.buttonText}>Descartar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                underlayColor={"none"}
                onPress={onCloseModal}
                style={styles.buttonSave}
                // disabled={isSaving}
              >
                <Text style={styles.buttonText}>Aceptar</Text>
              </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: "center",
    backgroundColor: theme.colors.gray4,
    borderRadius: 5,
    flexDirection: "row",
    marginRight: 10,
    marginVertical: 10,
    padding: 10,
  },
  buttonSave: {
    alignItems: "center",
    backgroundColor: theme.colors.button1,
    borderRadius: 5,
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    alignItems: "flex-end",
    // backgroundColor: theme.colors.gray4,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },

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
  },
});
