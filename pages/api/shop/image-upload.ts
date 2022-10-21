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
  if (req.method !== "POST") {
    res.status(400).end()
  }

  const data = await new Promise(function (resolve) {
    const form = new IncomingForm({
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

  const { image_type: imageType, shop_id: shopID } = data.fields

  const acceptedImageTypes = ["logo", "background"]
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    res.status(400).json({ error: "Wrong parameters (1)." })

    return
  }

  if (!shopID || shopID === "" || !validateUUID(shopID)) {
    res.status(400).json({ error: "Wrong parameters (2)." })

    return
  }

  const { image } = data.files

  if (!image || image?.size === 0) {
    res.status(400).json({ error: "Wrong parameters (3)." })

    return
  }

  const { type: mime, path } = image
  const acceptedMimeTypes = ["image/png", "image/jpeg"]
  if (!mime || !acceptedMimeTypes.includes(mime)) {
    res.status(400).json({ error: "Wrong parameters (4)." })

    return
  }

  const selectData = await prisma.shop.findUnique({ where: { id: shopID } })
  // .select({ oldKey: imageType }) // TODO: what does this do???

  if (!selectData || !Array.isArray(selectData) || selectData.length === 0) {
    res.status(400).json({ error: "Wrong parameters (5)." })

    return
  }

  const { oldKey } = selectData[0]

  const extension = mime === "image/png" ? "png" : "jpg"
  const random = randomString(10)
  const key = `${shopID}-${imageType}-${random}.${extension}`

  await uploadFile(path, key, mime)

  const patch = {}
  patch[imageType] = key
  await prisma.shop.update({ where: { id: shopID }, data: { patch } })

  if (oldKey) deleteFile(oldKey)

  res.json({ image: key })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
