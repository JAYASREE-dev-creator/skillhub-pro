const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {

    let resourceType = "image"

    if (file.mimetype === "application/pdf") {
      resourceType = "raw"
    }

    return {
      folder: "skillhub_uploads",
      resource_type: resourceType,
      type: "upload",
      public_id: Date.now() + "-" + file.originalname,
    }
  },
});