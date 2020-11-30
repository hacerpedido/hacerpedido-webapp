const formidable = require("formidable");
const s3utils = require("../../lib/utils/aws-s3");
const utils = require("../../lib/utils/utils");
const validator = require('validator');


export default async function handler(req, res) {
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

  const { image } = data.files;

  if (!image || image?.size === 0) {
    res.status(400).json({ error: "Wrong parameters (3)." });

    return;
  }

  const { type: mime, path } = image;

  const acceptedMimeTypes = ["image/png", "image/jpeg"];
  if (!mime || !acceptedMimeTypes.includes(mime)) {
    res.status(400).json({ error: "Wrong parameters (4)." });

    return;
  }

  const selectData = await pg.select({ oldKey: imageType }).from("shops").where("id", "=", shopID);

  if (!selectData || (!Array.isArray(selectData) || selectData.length === 0)) {
    res.status(400).json({ error: "Wrong parameters (5)." });

    return;
  }

  const { oldKey } = selectData[0];

  const extension = mime === "image/png" ? "png" : "jpg";
  const random = utils.randomString(10);
  const key = `${shopID}-${imageType}-${random}.${extension}`;

  await s3utils.uploadFile(path, key, mime);

  await pg("shops").where("id", "=", shopID).update(imageType, key);

  if (oldKey) {
    s3utils.deleteFile(oldKey);
  }

  res.status(200).json({ image: key });

  //   {
  //     "data": {
  //         "fields": {
  //             "shop_id": "b3f338f9-43c4-45a0-a6b2-fd8af6be9b75",
  //             "image_type": "logo",
  //         },
  //         "files": {
  //             "image": {
  //                 "size": 11446873,
  //                 "path": "/var/folders/wz/2dg67cnn6gg2n5pkypy9jxtw0000gn/T/upload_d9d91e9e8d1ff109451c35778b54d845.JPG",
  //                 "name": "_DSF0777.JPG",
  //                 "type": "image/jpeg",
  //                 "mtime": "2020-11-25T10:40:09.775Z"
  //             }
  //         }
  //     }
  // }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
