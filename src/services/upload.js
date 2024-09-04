const cloudinary = require("../configs/cloudinary");
const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("../configs/s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const randomImageName = () => crypto.randomBytes(16).toString("hex");

// S3 Client
const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const imageName = randomImageName();
    // config upload image
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
      Body: file.buffer,
      ContentType: "image/jpeg",
    });

    // upload image
    const result = await s3.send(command);
    console.log("S3 upload result:::", result);

    // config public url
    const signedUrl = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
    });

    // export public url
    const url = await getSignedUrl(s3, signedUrl, { expiresIn: 3600 });

    return {
      url: process.env.AWS_CLOUDFRONT + "/" + imageName,
      result,
    };
  } catch (error) {
    console.error(error + "when uploading image S3");
  }
};

// Cloudinary
const uploadImageFromUrl = async () => {
  try {
    const urlImage =
      "https://e7.pngegg.com/pngimages/458/39/png-clipart-mobile-banking-computer-icons-bank-service-logo.png";
    const folderName = "lewishop/logo";
    const newFileName = "demo";

    const result = await cloudinary.uploader.upload(urlImage, {
      public_id: newFileName,
      folder: folderName,
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

const uploadImageFromLocal = async ({
  path,
  folderName = "lewishop/logo",
  name = "image",
}) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: name,
      folder: folderName,
    });
    return {
      img_url: result.secure_url,
      thumb_url: cloudinary.url(result.public_id, {
        height: 100,
        width: 100,
        format: "jpg",
      }),
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
  uploadImageFromLocalS3,
};
