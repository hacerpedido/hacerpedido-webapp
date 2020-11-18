import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller } from "react-hook-form";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// import Input from "components/ShopInput";
import theme from "assets/theme";

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio = window.devicePixelRatio || 1;

// We resize the canvas down when saving on retina devices otherwise the image
// will be double or triple the preview size.
function getResizedCanvas(canvas, newWidth, newHeight) {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = newWidth;
  tmpCanvas.height = newHeight;

  const ctx = tmpCanvas.getContext("2d");
  ctx.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    newWidth,
    newHeight
  );

  return tmpCanvas;
}

function generateDownload(previewCanvas, crop) {
  if (!crop || !previewCanvas) {
    return;
  }

  const canvas = getResizedCanvas(previewCanvas, crop.width, crop.height);

  canvas.toBlob(
    (blob) => {
      const previewUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.download = "cropPreview.png";
      anchor.href = URL.createObjectURL(blob);
      anchor.click();

      window.URL.revokeObjectURL(previewUrl);
    },
    "image/png",
    1
  );
}

export default ({ onCloseModal }) => {
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Hello World!</Text>
        <TouchableHighlight style={styles.openButton} onPress={onCloseModal}>
          <Text style={styles.textStyle}>Hide Modal</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    alignItems: "center",
    flex: 1,
    height: "100vh",
    justifyContent: "center",
    marginTop: 22,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    alignItems: "center",
    backgroundColor: "red",
    elevation: 5,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
