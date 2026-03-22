const express = require("express")
const router = express.Router()

const Message = require("../models/Message")
const { protect } = require("../middleware/authMiddleware")

/* SEND MESSAGE */

router.post("/send", protect, async (req,res)=>{

 try{

  const { sender, receiver, text } = req.body

  if(!sender || !receiver || !text){
   return res.status(400).json({
    message:"Missing message data"
   })
  }

  const message = new Message({
   sender,
   receiver,
   text
  })

  await message.save()

  res.json({
   message:"Message sent",
   data:message
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* GET CHAT HISTORY BETWEEN TWO USERS */

router.get("/history/:userA/:userB", protect, async (req,res)=>{

 try{

  const { userA, userB } = req.params

  const messages = await Message.find({
   $or:[
    { sender:userA, receiver:userB },
    { sender:userB, receiver:userA }
   ]
  })
  .sort({createdAt:1})

  res.json(messages)

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* GET ALL CONVERSATIONS OF USER */

router.get("/conversations/:userId", protect, async(req,res)=>{

 try{

  const { userId } = req.params

  const messages = await Message.find({
   $or:[
    { sender:userId },
    { receiver:userId }
   ]
  })
  .sort({createdAt:-1})

  res.json(messages)

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* FLAG MESSAGE (FOR COMPLAINT SYSTEM) */

router.put("/flag/:id", protect, async(req,res)=>{

 try{

  const message = await Message.findById(req.params.id)

  if(!message){
   return res.status(404).json({
    message:"Message not found"
   })
  }

  message.flagged = true

  await message.save()

  res.json({
   message:"Message flagged for admin review"
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

module.exports = router