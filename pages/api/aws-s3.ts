// TODO: use next.js export default async function handler(req, res) {
import fs from "fs"

import S3 from "aws-sdk/clients/s3"

export async function uploadFile(fileName, key, mime) {
  const fileContent = fs.readFileSync(fileName)

  const s3 = new S3({
    accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY,
  })

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key, // File name
    Body: fileContent,
    ContentType: mime,
    ACL: "public-read",
  }

  try {
    await s3.upload(params).promise()
    // console.log(`Uploaded: ${key}`);
  } catch (err) {
    throw err
  }
}

export async function deleteFile(key) {
  const s3 = new S3({
    accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY,
  })

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key, // File name
  }

  try {
    await s3.deleteObject(params).promise()
    // console.log(`Deleted : ${key}`);
  } catch (err) {
    throw err
  }
}
