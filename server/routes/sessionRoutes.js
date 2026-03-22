const express = require("express")
const router = express.Router()

const Session = require("../models/Session")
const MatchRequest = require("../models/MatchRequest")
const { protect } = require("../middleware/authMiddleware")

/* CREATE SESSION */

router.post("/schedule", protect, async(req,res)=>{

 try{

  const userA = req.user._id
  const { userB, date, notes } = req.body

  if(!userB || !date){
   return res.status(400).json({
    message:"Missing session information"
   })
  }

  /* CHECK ACCEPTED MATCH */

  const match = await MatchRequest.findOne({
   $or:[
    { sender:userA, receiver:userB, status:"accepted" },
    { sender:userB, receiver:userA, status:"accepted" }
   ]
  })

  if(!match){
   return res.status(403).json({
    message:"Session allowed only after match acceptance"
   })
  }

  const session = new Session({
   userA,
   userB,
   date,
   notes,
   status:"scheduled"
  })

  await session.save()

  res.json({
   message:"Session scheduled successfully",
   session
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* GET USER SESSIONS */

router.get("/user/:id", protect, async(req,res)=>{

 try{

  const sessions = await Session.find({
   $or:[
    { userA:req.params.id },
    { userB:req.params.id }
   ]
  })
  .populate("userA","name")
  .populate("userB","name")
  .sort({date:-1})

  res.json(sessions)

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* COMPLETE SESSION */

router.post("/complete", protect, async(req,res)=>{

 try{

  const { sessionId } = req.body

  const session = await Session.findById(sessionId)

  if(!session){
   return res.status(404).json({
    message:"Session not found"
   })
  }

  /* ONLY PARTICIPANTS CAN COMPLETE */

  if(
   session.userA.toString() !== req.user._id.toString() &&
   session.userB.toString() !== req.user._id.toString()
  ){
   return res.status(403).json({
    message:"Not authorized"
   })
  }

  session.status = "completed"

  await session.save()

  res.json({
   message:"Session completed",
   session
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* CANCEL SESSION */

router.post("/cancel", protect, async(req,res)=>{

 try{

  const { sessionId } = req.body

  const session = await Session.findById(sessionId)

  if(!session){
   return res.status(404).json({
    message:"Session not found"
   })
  }

  session.status = "cancelled"

  await session.save()

  res.json({
   message:"Session cancelled"
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

/* SESSION STATISTICS */

router.get("/stats/:userId", protect, async(req,res)=>{

 try{

  const completed = await Session.countDocuments({
   status:"completed",
   $or:[
    {userA:req.params.userId},
    {userB:req.params.userId}
   ]
  })

  let stars = 0

  if(completed >= 100) stars = 5
  else if(completed >= 75) stars = 4
  else if(completed >= 50) stars = 3
  else if(completed >= 25) stars = 2
  else if(completed >= 10) stars = 1

  res.json({
   completedSessions:completed,
   stars
  })

 }catch(err){

  res.status(500).json({
   message:err.message
  })

 }

})

module.exports = router