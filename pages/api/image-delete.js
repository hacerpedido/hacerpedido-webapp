import { withSentry } from '@sentry/nextjs';
const formidable = require("formidable");
const s3utils = require("../../lib/utils/aws-s3");
const validator = require('validator');

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).end();
  }

  const pg = require("knex")({
    client: "pg",
    connection: process.env.PG_CONNECTION_STRING,
  });

  const data = await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({ keepExtensions: true, multiples: false });

    form.parse(req, function (err, fields, files) {
      if (err) {
        res.status(400).json({ error: err.message });

        return;
      }

      resolve({ fields, files });
    });
  });

  const { image_type: imageType, shop_id: shopID } = data.fields;

  const acceptedImageTypes = ["logo", "background"];
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    res.status(400).json({ error: "Wrong parameters (1)." });

    return;
  }

  if (!shopID || shopID === "" || !validator.isUUID(shopID)) {
    res.status(400).json({ error: "Wrong parameters (2)." });

    return;
  }

  const selectData = await pg.select({ oldKey: imageType }).from("shops").where("id", "=", shopID);

  if (!selectData || (!Array.isArray(selectData) || selectData.length === 0)) {
    res.status(400).json({ error: "Wrong parameters (5)." });

    return;
  }

  const { oldKey } = selectData[0];

  await pg("shops").where("id", "=", shopID).update(imageType, null);

  if (oldKey) {
    await s3utils.deleteFile(oldKey);
  }

  res.status(200).json({ deleted: oldKey });

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
};

export default withSentry(handler);
