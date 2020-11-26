const fs = require("fs");
const AWS = require("aws-sdk");

export function uploadFile(fileName, key, mime) {
  const fileContent = fs.readFileSync(fileName);

  const params = {
    Bucket: process.env.AWS_IMAGES_BUCKET,
    Key: key, // File name
    Body: fileContent,
    ContentType: mime,
    ACL: "public-read",
  };

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`Uploaded: ${key}`);
  });
}

export function deleteFile(key) {
  const params = {
    Bucket: process.env.AWS_IMAGES_BUCKET,
    Key: key, // File name
  };

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  s3.deleteObject(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`Deleted: ${key}`);
  });
}
