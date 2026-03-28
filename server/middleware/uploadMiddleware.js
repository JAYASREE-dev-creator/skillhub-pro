const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // ✅ THIS WAS MISSING
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {

    let resourceType = "image";

    if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    return {
      folder: "skillhub_uploads",
      resource_type: resourceType,
      type: "upload",
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;