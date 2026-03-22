const express = require("express")
const router = express.Router()

const User = require("../models/User")


/* GET ALL PENDING USERS */

router.get("/pending", async (req,res)=>{

try{

const users = await User.find({verificationStatus:"pending"})
.select("name email")

res.json(users)

}catch(err){

res.status(500).json({message:err.message})

}

})


/* GET SINGLE USER DETAILS */

router.get("/user/:id", async (req,res)=>{

try{

const user = await User.findById(req.params.id)
.select("-password")

if(!user){
return res.status(404).json({message:"User not found"})
}

res.json(user)

}catch(err){

res.status(500).json({message:err.message})

}

})


/* VERIFY USER */

router.put("/verify/:id", async (req,res)=>{

try{

const user = await User.findById(req.params.id)

if(!user){
return res.status(404).json({message:"User not found"})
}

user.verificationStatus = "verified"

await user.save()

res.json({message:"User verified successfully"})

}catch(err){

res.status(500).json({message:err.message})

}

})


/* DELETE USER */

router.delete("/delete/:id", async (req,res)=>{

try{

const user = await User.findById(req.params.id)

if(!user){
return res.status(404).json({message:"User not found"})
}

await User.findByIdAndDelete(req.params.id)

res.json({message:"User rejected and removed"})

}catch(err){

res.status(500).json({message:err.message})

}

})


/* ADMIN STATISTICS */

router.get("/stats", async (req,res)=>{

try{

const totalUsers = await User.countDocuments()

const verifiedUsers = await User.countDocuments({
verificationStatus:"verified"
})

const pendingUsers = await User.countDocuments({
verificationStatus:"pending"
})

res.json({
totalUsers,
verifiedUsers,
pendingUsers
})

}catch(err){

res.status(500).json({message:err.message})

}

})


module.exports = router