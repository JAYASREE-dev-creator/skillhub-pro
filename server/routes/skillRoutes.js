const express = require("express")
const router = express.Router()

const User = require("../models/User")
const { protect } = require("../middleware/authMiddleware")

/* GET USER SKILLS */

router.get("/my-skills", protect, async (req,res)=>{

 try{

  const user = await User.findById(req.user._id).select(
   "skillsOffered skillsWanted"
  )

  res.json(user)

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* UPDATE USER SKILLS */

router.put("/update", protect, async (req,res)=>{

 try{

  const { skillsOffered, skillsWanted } = req.body

  const user = await User.findById(req.user._id)

  if(!user){
   return res.status(404).json({
    message:"User not found"
   })
  }

  if(skillsOffered){
   user.skillsOffered = skillsOffered
  }

  if(skillsWanted){
   user.skillsWanted = skillsWanted
  }

  await user.save()

  res.json({
   message:"Skills updated successfully",
   skillsOffered:user.skillsOffered,
   skillsWanted:user.skillsWanted
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* GET USER PROFILE SKILLS */

router.get("/user/:id", protect, async (req,res)=>{

 try{

  const user = await User.findById(req.params.id).select(
   "name skillsOffered skillsWanted"
  )

  if(!user){
   return res.status(404).json({
    message:"User not found"
   })
  }

  res.json(user)

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

module.exports = router