import { IncomingForm } from "formidable"
import type { NextApiRequest, NextApiResponse } from "next"

import { deleteFile } from "@/lib/aws-s3"
import prisma from "lib/prisma"
import { validateUUID } from "lib/utils/utils"

type ResponseData = {
  deleted: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "DELETE") res.status(400).end()

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

  const selectData = await prisma.shop.findUnique({ where: { id: shopID } })
  // .select({ oldKey: imageType }) // TODO: what does this do???

  if (!selectData || !Array.isArray(selectData) || selectData.length === 0) {
    res.status(400).json({ error: "Wrong parameters (5)." })

    return
  }

  const { oldKey } = selectData[0]

  const patch = {}
  patch[imageType] = null
  await prisma.shop.update({ where: { id: shopID }, data: { patch } })

  if (oldKey) await deleteFile(oldKey)

  res.json({ deleted: oldKey })

  //   {
  //     "data": {
  //         "fields": {
  //             "shop_id": "b3f338f9-43c4-45a0-a6b2-fd8af6be9b75",
  //             "image_type": "logo",
  //         },
  //     }
  // }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
