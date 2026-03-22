const express = require("express")
const router = express.Router()

const Message = require("../models/Message")
const MatchRequest = require("../models/MatchRequest")
const { protect } = require("../middleware/authMiddleware")

/* SEND MESSAGE */

router.post("/send", protect, async (req,res)=>{

 try{

  const senderId = req.user._id
  const { receiverId, message } = req.body

  if(!receiverId || !message){
   return res.status(400).json({
    message:"Receiver and message required"
   })
  }

  /* CHECK IF USERS ARE MATCHED */

  const match = await MatchRequest.findOne({
   $or:[
    { sender:senderId, receiver:receiverId, status:"accepted" },
    { sender:receiverId, receiver:senderId, status:"accepted" }
   ]
  })

  if(!match){
   return res.status(403).json({
    message:"Chat allowed only after match request is accepted"
   })
  }

  const newMessage = new Message({
   sender:senderId,
   receiver:receiverId,
   text:message
  })

  await newMessage.save()

  res.json({
   message:"Message sent successfully",
   data:newMessage
  })

 }catch(err){

  console.error("Send Message Error:",err)

  res.status(500).json({
   message:"Failed to send message"
  })

 }

})


/* GET CHAT HISTORY (PRIMARY ROUTE) */

router.get("/history/:userId", protect, async (req,res)=>{

 try{

  const currentUser = req.user._id
  const otherUser = req.params.userId

  /* CHECK MATCH STATUS */

  const match = await MatchRequest.findOne({
   $or:[
    { sender:currentUser, receiver:otherUser, status:"accepted" },
    { sender:otherUser, receiver:currentUser, status:"accepted" }
   ]
  })

  if(!match){
   return res.status(403).json({
    message:"Chat history available only for matched users"
   })
  }

  const messages = await Message.find({
   $or:[
    { sender:currentUser, receiver:otherUser },
    { sender:otherUser, receiver:currentUser }
   ]
  })
  .sort({ createdAt:1 })

  res.json(messages)

 }catch(err){

  console.error("Chat History Error:",err)

  res.status(500).json({
   message:"Failed to load chat history"
  })

 }

})


/* SUPPORT LEGACY ROUTE FORMAT (history/:userA/:userB) */

router.get("/history/:userA/:userB", protect, async (req,res)=>{

 try{

  const userA = req.params.userA
  const userB = req.params.userB

  const messages = await Message.find({
   $or:[
    { sender:userA, receiver:userB },
    { sender:userB, receiver:userA }
   ]
  }).sort({ createdAt:1 })

  res.json(messages)

 }catch(err){

  console.error("Chat History Error:",err)

  res.status(500).json({
   message:"Failed to load chat history"
  })

 }

})

module.exports = router