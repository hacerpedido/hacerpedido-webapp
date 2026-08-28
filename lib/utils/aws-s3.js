const fs = require("fs");
const AWS = require("aws-sdk");

export async function uploadFile(fileName, key, mime) {
  const fileContent = fs.readFileSync(fileName);

  const s3 = new AWS.S3({
    accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key, // File name
    Body: fileContent,
    ContentType: mime,
    ACL: "public-read",
  };

  await s3.upload(params).promise();
}

export async function deleteFile(key) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key, // File name
  };

  await s3.deleteObject(params).promise();
}
