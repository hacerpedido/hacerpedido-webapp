import { useState, useCallback, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "react-drop-zone/dist/styles.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import dynamic from "next/dynamic";
import axios from "axios";

import theme from "../../assets/theme";

const DynamicStyledDropZone = dynamic(() => import("react-drop-zone").then((mod) => mod.StyledDropZone), {
  ssr: false,
});

// Increase pixel density for crop preview quality on retina screens.
const pixelRatio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;

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
    let data = new FormData();

    data.append("shop_id", shopID);
    data.append("image_type", imageType);

    setWaiting(true);
    axios
      .post(`${window.location.origin}/api/image-delete`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setWaiting(false);
        // console.log(res);
        handleClose({ forceRefresh: true });
      });
  };

  const onUpload = (crop) => {
    if (!crop) {
      return;
    }

    setWaiting(true);

    let data = new FormData();

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
      crop.height
    );

    canvas.toBlob(
      (blob) => {
        data.append("image", blob);
        data.append("shop_id", shopID);
        data.append("image_type", imageType);

        axios
          .post(`${window.location.origin}/api/image-upload`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            setWaiting(false);
            handleClose({ forceRefresh: true });
          });
      },
      "image/png",
      1
    );
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const footerStyles = image ? {} : { justifyContent: "right" };

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
                  circularCrop={circularCrop}
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                />
              </View>
            </View>
          )}
        </View>
      </Modal.Body>
      <Modal.Footer style={footerStyles}>
        {isWaiting && (
          <>
            <Text>Por favor, espere... </Text>
            <ActivityIndicator animating={isWaiting} size="large" color={theme.colors.orangeHP} />
          </>
        )}
        {!isWaiting && (
          <>
            {image && (
              <Button variant="primary" onClick={() => onUpload(completedCrop)}>
                Aceptar
              </Button>
            )}
            {!image && (
              <Button variant="primary" onClick={() => onDelete()}>
                Borrar imagen actual
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </>
  );
};

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
  },
});
