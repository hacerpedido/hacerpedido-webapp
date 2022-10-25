import type { NextApiRequest, NextApiResponse } from "next"

import { deleteFile } from "@/lib/aws-s3"
import prisma from "lib/prisma"
import { validateUUID } from "lib/utils/utils"

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const acceptedImageTypes = ["logo", "background"]

  if (req.method !== "DELETE") res.status(400).end()

  const { imageType, shopId } = req.query

  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    res.status(400).json({
      error: `Wrong parameters (1).${imageType}`,
    })

    return
  }

  if (!shopId || shopId === "" || !validateUUID(shopId)) {
    res.status(400).json({ error: "Wrong parameters (2)." })

    return
  }

  const found = await prisma.shop.findUnique({ where: { id: shopId } })
  // .select({ oldKey: imageType }) // TODO: what does this do???
  if (!found) return res.status(400).json({ error: "Not found." })

  const data = imageType == "logo" ? { logo: "" } : { background: "" }
  await prisma.shop.update({ where: { id: shopId }, data })
  await deleteFile(found[imageType])

  res.status(200).json({ message: "ok" })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
