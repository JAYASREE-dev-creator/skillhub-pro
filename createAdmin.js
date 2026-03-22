require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("./models/User")

mongoose.connect(process.env.MONGO_URI)

async function createAdmin(){

const hashedPassword = await bcrypt.hash("admin123",10)

const admin = new User({

name:"Admin",
email:"admin@skillhub.com",
password:hashedPassword,
role:"admin",
verificationStatus:"verified"

})

await admin.save()

console.log("Admin created successfully")

process.exit()

}

createAdmin()