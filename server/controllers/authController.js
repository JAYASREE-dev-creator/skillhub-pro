const User = require("../models/User")
const jwt = require("jsonwebtoken")

/* GENERATE TOKEN */

const generateToken = (id)=>{
 return jwt.sign(
  { id },
  process.env.JWT_SECRET,
  { expiresIn:"7d" }
 )
}

/* REGISTER USER */

const registerUser = async (req,res)=>{

 try{

  let { name,email,password,skillsOffered,skillsWanted } = req.body

  if(!name || !email || !password){
   return res.status(400).json({message:"All fields required"})
  }

  email = email.toLowerCase()

  const existingUser = await User.findOne({email})

  if(existingUser){
   return res.status(400).json({message:"User already exists"})
  }

  let aadhaarFile = ""
  let idCardFile = ""

  if(req.files){

   if(req.files.aadhaarFile && req.files.aadhaarFile.length>0){
    aadhaarFile = req.files.aadhaarFile[0].filename
   }

   if(req.files.idCardFile && req.files.idCardFile.length>0){
    idCardFile = req.files.idCardFile[0].filename
   }

  }

  const user = await User.create({

   name,
   email,
   password,

   skillsOffered: skillsOffered ? skillsOffered.split(",") : [],
   skillsWanted: skillsWanted ? skillsWanted.split(",") : [],

   aadhaarFile,
   idCardFile,

   verificationStatus:"pending"

  })

  res.status(201).json({

   _id:user._id,
   name:user.name,
   email:user.email,
   verificationStatus:user.verificationStatus,
   role:user.role,
   token:generateToken(user._id)

  })

 }catch(err){

  console.log("Register Error:",err)

  res.status(500).json({message:"Server error during registration"})

 }

}

/* LOGIN USER */

const loginUser = async (req,res)=>{

 try{

  let { email,password } = req.body

  if(!email || !password){
   return res.status(400).json({message:"Email and password required"})
  }

  email = email.toLowerCase()

  const user = await User.findOne({email})

  if(!user){
   return res.status(401).json({message:"Invalid email or password"})
  }

  /* CHECK VERIFICATION FIRST */

if(user.verificationStatus !== "verified"){
 return res.status(403).json({
  message:"Your account is pending admin verification"
 })
}

/* THEN CHECK PASSWORD */

const isMatch = await user.matchPassword(password)

if(!isMatch){
 return res.status(401).json({message:"Invalid email or password"})
}


  res.json({

   _id:user._id,
   name:user.name,
   email:user.email,
   verificationStatus:user.verificationStatus,
   role:user.role,
   token:generateToken(user._id)

  })

 }catch(err){

  console.log("Login Error:",err)

  res.status(500).json({message:"Server error during login"})

 }

}

module.exports = {
 registerUser,
 loginUser
}