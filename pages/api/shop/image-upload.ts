import formidable from "formidable"
import type { NextApiRequest, NextApiResponse } from "next"

import { uploadFile, deleteFile } from "@/lib/aws-s3"
import prisma from "lib/prisma"
import { validateUUID } from "lib/utils/utils"

function randomString(
  length: number,
  characters = "abcdefghijklmnopqrstuvwxyz0123456789"
) {
  let result = ""
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

type ResponseData = {
  image: string
}
type ResponseError = {
  error: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) => {
  if (req.method !== "POST") return res.status(400)

  const { fields, files } = await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      multiples: false,
    })

    form.parse(req, function (err, fields, files) {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }

      resolve({ fields, files })
    })
  })

  const { image_type: imageType, shop_id: shopId } = fields
  const { image } = files

  const acceptedImageTypes = ["logo", "background"]

  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return res.status(400).json({ error: "Wrong parameters (1)." })
  }

  if (!shopId || shopId === "" || !validateUUID(shopId)) {
    return res.status(400).json({ error: "Wrong parameters (2)." })
  }

  if (!image || image.size === 0) {
    return res.status(400).json({ error: "Wrong parameters (3)." })
  }

  const { mimetype, filepath } = image
  const acceptedMimeTypes = ["image/png", "image/jpeg"]

  if (!mimetype || !acceptedMimeTypes.includes(mimetype)) {
    return res.status(400).json({ error: "Wrong parameters (4)." })
  }

  const found = await prisma.shop.findUnique({ where: { id: shopId } })
  // .select({ oldKey: imageType }) // TODO: what does this do???

  if (!found) return res.status(400).json({ error: "Wrong parameters (5)." })

  const extension = mimetype === "image/png" ? "png" : "jpg"
  const random = randomString(10)
  const key = `${shopId}-${imageType}-${random}.${extension}`

  console.log(filepath)

  await uploadFile(filepath, key, mimetype)

  const patch = {}
  patch[imageType] = key

  await prisma.shop.update({ where: { id: shopId }, data: patch })
  const oldFile = found[imageType]
  if (oldFile) deleteFile(oldFile) // TODO: Re enable this

  res.json({ image: key })
}

export default handler
