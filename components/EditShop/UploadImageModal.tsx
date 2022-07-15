/* eslint-disable @next/next/no-img-element */
import axios from "axios"
import { useState, useCallback, useRef, useMemo } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Dropzone from "react-dropzone"
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop"
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
  image: string | undefined
  show: boolean
  onHide: () => void
}

const UploadImageModal = ({
  shopID,
  imageType,
  image,
  show,
  onHide,
}: Props) => {
  const aspect = useMemo(() => (imageType === "logo" ? 1 : 1.2014), [imageType])
  const circularCrop = useMemo(() => imageType === "logo", [imageType])

  const imgRef = useRef()
  const [isWaiting, setIsWaiting] = useState(false)
  const [imageCrop, setImageCrop] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader()
    const file = acceptedFiles[0]

    reader.onabort = () => console.log("file reading was aborted")
    reader.onerror = () => console.log("file reading has failed")
    reader.onload = () => setImageCrop(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const onDelete = () => {
    const data = new FormData()

    data.append("shop_id", shopID)
    data.append("image_type", imageType)

    setIsWaiting(true)

    // TODO: should be a put/patch request
    axios
      .post(`${window.location.origin}/api/image-delete`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setIsWaiting(false)
        onHide()
      })
  }

  const onUpload = () => {
    if (!completedCrop) return

    const imgSrc = imgRef.current as HTMLImageElement

    setIsWaiting(true)

    const scaleX = imgSrc.naturalWidth / imgSrc.width
    const scaleY = imgSrc.naturalHeight / imgSrc.height

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    ctx.drawImage(
      imgSrc,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    canvas.toBlob(
      (file) => {
        const data = new FormData()
        data.append("image", file)
        data.append("shop_id", shopID)
        data.append("image_type", imageType)

        axios
          .post(`${window.location.origin}/api/shop/image-upload`, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(() => {
            setIsWaiting(false)
            onHide()
          })
      },
      "image/png",
      1
    )
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 100,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    )

    setCrop(crop)
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sube una imagen</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <View style={styles.uploaderContainer}>
          {!imageCrop && typeof window !== "undefined" && (
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
          {imageCrop && (
            <View style={styles.preview}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                circularCrop={circularCrop}
                aspect={aspect}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  alt="Recortar imagen"
                  src={imageCrop}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </View>
          )}
        </View>
      </Modal.Body>

      {(isWaiting || imageCrop || image) && (
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
          {!isWaiting && imageCrop && (
            <Button variant="primary" onClick={() => onUpload()}>
              Aceptar
            </Button>
          )}
          {!isWaiting && image && (
            <Button variant="primary" onClick={onDelete}>
              Borrar imagen actual
            </Button>
          )}
        </Modal.Footer>
      )}
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
