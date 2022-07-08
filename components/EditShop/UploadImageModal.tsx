/* eslint-disable @next/next/no-img-element */
import axios from "axios"
import { useState, useCallback, useRef, useMemo } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Dropzone from "react-dropzone"
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Crop, PixelCrop } from "react-image-crop/src/types"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"

import theme from "lib/theme"

type Props = {
  shopID: string
  imageType: string
  show: boolean
  onHide: () => void
}

const UploadImageModal = ({ shopID, imageType, show, onHide }: Props) => {
  const [isWaiting, setWaiting] = useState(false)
  const [imgSrc, setImgSrc] = useState("")
  // const [imageUpload, setImageUpload] = useState()
  const imgRef = useRef<HTMLImageElement | null>(null)

  const aspect = useMemo(() => (imageType === "logo" ? 1 : 1.2), [imageType])
  const circularCrop = useMemo(() => imageType === "logo", [imageType])

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onDrop = useCallback(
    (acceptedFiles: any[]) => {
      const file = acceptedFiles[0]
      setImgSrc(file)
      // const reader = new FileReader()
      // reader.onload = () => setImageUpload(reader.result)
      // reader.readAsDataURL(file)
    },
    [setImgSrc]
  )

  const onDelete = () => {
    const data = new FormData()

    data.append("shop_id", shopID)
    data.append("image_type", imageType)

    setWaiting(true)
    axios
      .post(`${window.location.origin}/api/image-delete`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setWaiting(false)
        onHide()
      })
  }

  const onUpload = (crop: PixelCrop) => {
    if (!crop) return

    setWaiting(true)

    const image = imgRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Increase pixel density for crop preview quality on retina screens.
    const pixelRatio =
      (typeof window !== "undefined" && window.devicePixelRatio) || 1

    canvas.width = crop.width * pixelRatio
    canvas.height = crop.height * pixelRatio

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

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
    )

    canvas.toBlob(
      (blob) => {
        const data = new FormData()
        data.append("image", blob)
        data.append("shop_id", shopID)
        data.append("image_type", imageType)

        axios
          .post(`${window.location.origin}/api/image-upload`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(() => {
            setWaiting(false)
            onHide()
          })
      },
      "image/png",
      1
    )
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // if (aspect) {
    //   const { width, height } = e.currentTarget
    //   setCrop(centerAspectCrop(width, height, aspect))
    // }
    imgRef.current = e.currentTarget
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sube una imagen</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <View style={styles.uploaderContainer}>
          {!imgSrc && typeof window !== "undefined" && (
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Haga click o arrastre un archivo aquí</p>
                  </div>
                </section>
              )}
            </Dropzone>
          )}
          {imgSrc && (
            <View style={styles.preview}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                circularCrop={circularCrop}
                aspect={aspect}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  alt="Recortar imagen"
                  src={imgSrc}
                  // onLoad={onImageLoad}
                />
              </ReactCrop>
            </View>
          )}
        </View>
      </Modal.Body>

      <Modal.Footer>
        {isWaiting && (
          <>
            <Text>Por favor, espere... </Text>
            <ActivityIndicator
              animating={isWaiting}
              size="large"
              color={theme.colors.orangeHP}
            />
          </>
        )}
        {!isWaiting && (
          <>
            {imgSrc && (
              <Button variant="primary" onClick={() => onUpload(completedCrop)}>
                Aceptar
              </Button>
            )}
            {!imgSrc && (
              <Button variant="primary" onClick={() => onDelete()}>
                Borrar imagen actual
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default UploadImageModal

type Styles = {
  containerView: ViewStyle
  textClose: TextStyle
  title: TextStyle
  titleView: ViewStyle
  uploaderContainer: ViewStyle
  preview: TextStyle
}

const styles = StyleSheet.create<Styles>({
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
  textClose: {
    borderRadius: 5,
    color: theme.colors.black,
    fontSize: 24,
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
  preview: {
    alignItems: "center",
    backgroundColor: theme.colors.gray4,
    justifyContent: "center",
    maxHeight: "75vh",
    overflow: "scroll",
  },
})
