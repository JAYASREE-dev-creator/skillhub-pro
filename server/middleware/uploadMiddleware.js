const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* CLOUDINARY CONFIG */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* STORAGE CONFIG */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skillhub_uploads",
    resource_type: "auto", // supports pdf, images, etc
  },
});

/* MULTER SETUP */

const upload = multer({ storage });

module.exports = upload;