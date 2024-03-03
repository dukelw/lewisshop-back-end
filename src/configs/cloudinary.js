// Require the cloudinary library
const cloudinary = require("cloudinary").v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "lewisshop",
  api_key: "142223882891755",
  api_secret: process.env.CLOUDINARY_KEY_SECRET,
});

// Log the configuration
console.log(cloudinary.config());

module.exports = cloudinary;
