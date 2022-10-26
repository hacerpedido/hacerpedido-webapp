import { IncomingForm } from "formidable"

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") res.status(400).end()

  const data = await new Promise(function (resolve) {
    const form = new IncomingForm({ multiples: false })

    form.parse(req, function (err, fields, files) {
      if (err) return res.status(400).json({ error: err.message })
      resolve({ fields, files })
    })
  })

  // This is not working
  const { image_type: imageType, shop_id: shopId } = data.fields
  console.log(data.fields);
  console.log(req.query);
  
  const acceptedImageTypes = ["logo", "background"]

  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return res.status(400).json({ error: "Wrong parameters (1)." })
  }

  if (!shopId || shopId === "" || !validateUUID(shopId)) {
    return res.status(400).json({ error: "Wrong parameters (2)." })
  }

  const { image } = data.files

  if (!image || image?.size === 0) {
    return res.status(400).json({ error: "Wrong parameters (3)." })
  }

  const { type: mime, path } = image
  const acceptedMimeTypes = ["image/png", "image/jpeg"]

  if (!mime || !acceptedMimeTypes.includes(mime)) {
    return res.status(400).json({ error: "Wrong parameters (4)." })
  }

  const found = await prisma.shop.findUnique({ where: { id: shopId } })
  // .select({ oldKey: imageType }) // TODO: what does this do???

  if (!found) return res.status(400).json({ error: "Wrong parameters (5)." })

  const { oldKey } = found

  const extension = mime === "image/png" ? "png" : "jpg"
  const random = randomString(10)
  const key = `${shopId}-${imageType}-${random}.${extension}`

  await uploadFile(path, key, mime)

  let patch = {}
  patch[imageType] = key

  await prisma.shop.update({ where: { id: shopId }, data: { patch } })

  // if (oldKey) deleteFile(oldKey) // TODO: Re enable this

  res.json({ image: key })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
