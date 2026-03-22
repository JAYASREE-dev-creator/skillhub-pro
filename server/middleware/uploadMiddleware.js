const multer = require("multer")
const path = require("path")
const fs = require("fs")

/* CREATE UPLOAD DIRECTORY IF NOT EXISTS */

const uploadDir = "uploads"

if(!fs.existsSync(uploadDir)){
 fs.mkdirSync(uploadDir)
}

/* STORAGE CONFIGURATION */

const storage = multer.diskStorage({

 destination:(req,file,cb)=>{
  cb(null,uploadDir)
 },

 filename:(req,file,cb)=>{

  const uniqueName =
   file.fieldname +
   "_" +
   Date.now() +
   "_" +
   Math.round(Math.random()*1E9) +
   path.extname(file.originalname)

  cb(null,uniqueName)

 }

})

/* FILE TYPE VALIDATION */

const fileFilter = (req,file,cb)=>{

 const allowedTypes = /jpeg|jpg|png|pdf/

 const extname = allowedTypes.test(
  path.extname(file.originalname).toLowerCase()
 )

 const mimetype = allowedTypes.test(file.mimetype)

 if(extname && mimetype){
  cb(null,true)
 }else{
  cb(new Error("Only JPG, PNG, or PDF files are allowed"))
 }

}

/* MULTER INSTANCE */

const upload = multer({

 storage:storage,

 limits:{
  fileSize:2 * 1024 * 1024   // 2MB
 },

 fileFilter:fileFilter

})

module.exports = upload