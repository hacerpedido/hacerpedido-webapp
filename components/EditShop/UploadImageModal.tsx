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
  image: string | null
  show: boolean
  handleHide: () => void
  onImageDelete: (imageType: string) => void
}

const UploadImageModal = ({
  shopID: shopId,
  imageType,
  image,
  show,
  handleHide,
  onImageDelete,
}: Props) => {
  const aspect = useMemo(() => (imageType === "logo" ? 1 : 1.2014), [imageType])
  const circularCrop = useMemo(() => imageType === "logo", [imageType])

  const imgRef = useRef()
  const [isLoading, setIsLoading] = useState(false)
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

  const onDelete = async () => {
    setIsLoading(true)

    try {
      const response = await axios({
        method: "delete",
        url: "/api/shop/image-delete/",
        params: { imageType, shopId },
      })
      console.log(response.data)
      onImageDelete(imageType)
    } catch (err) {
      // TODO: Replace this with a proper user error
      console.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onUpload = () => {
    if (!completedCrop) return

    const imgSrc = imgRef.current as HTMLImageElement

    setIsLoading(true)

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
      async (file) => {
        const data = new FormData()
        data.append("image", file)
        data.append("shop_id", shopId)
        data.append("image_type", imageType)

        await axios({
          url: "/api/shop/image-upload",
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          params: data,
        })
          // .then(() => handleHide())
          // .catch((error) => console.error(error.message))

        setIsLoading(false)
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
    <Modal show={show} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sube una imagen</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <View style={s.uploaderContainer}>
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
            <View style={s.preview}>
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

      {(isLoading || imageCrop || image) && (
        <Modal.Footer>
          <View style={s.footerContainer}>
            {isLoading && (
              <>
                <Text>Por favor, espere... </Text>
                <ActivityIndicator size="large" color={theme.colors.orangeHP} />
              </>
            )}

            {!isLoading && imageCrop && (
              <Button variant="primary" onClick={() => onUpload()}>
                Aceptar
              </Button>
            )}

            {!isLoading && image && (
              <Button variant="primary" onClick={onDelete}>
                Borrar imagen actual
              </Button>
            )}
          </View>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default UploadImageModal

type Styles = {
  footerContainer: ViewStyle
  containerView: ViewStyle
  textClose: TextStyle
  title: TextStyle
  titleView: ViewStyle
  uploaderContainer: ViewStyle
  preview: TextStyle
}

const s = StyleSheet.create<Styles>({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 12,
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
