const express = require("express")
const router = express.Router()

const User = require("../models/User")
const MatchRequest = require("../models/MatchRequest")
const { protect } = require("../middleware/authMiddleware")
const { findTopMatches } = require("../services/matchEngine")

/* FIND TOP MATCHES */

router.get("/find", protect, async (req, res) => {

 try {

  const currentUser = await User.findById(req.user._id)

  if (!currentUser) {
   return res.status(404).json({ message: "User not found" })
  }

  /* FETCH ALL OTHER VERIFIED USERS */

  const users = await User.find({
   verificationStatus: "verified",
   _id: { $ne: currentUser._id }
  })

  /* CALCULATE MATCHES */

  const rawMatches = findTopMatches(currentUser, users)

  /* RETURN TOP 3 ONLY */

  const topMatches = rawMatches.slice(0, 3)

  /* FORMAT FOR FRONTEND */

  const matches = topMatches.map(user => {

   const offered = user.skillsOffered || []
   const wanted = user.skillsWanted || []

   const mutualTeach = offered.filter(skill =>
    (currentUser.skillsWanted || []).includes(skill)
   )

   const mutualLearn = (currentUser.skillsOffered || []).filter(skill =>
    wanted.includes(skill)
   )

   return {
    id: user.id,
    name: user.name,
    score: user.score,

    /* ADDED FOR DASHBOARD DISPLAY */

    skillsOffered: offered,
    skillsWanted: wanted,

    mutualTeach,
    mutualLearn
   }

  })

  res.json(matches)

 } catch (err) {

  console.error("Match error:", err)

  res.status(500).json({
   message: "Match calculation failed",
   error: err.message
  })

 }

})

/* SEND MATCH REQUEST */

router.post("/request", protect, async (req, res) => {

 try {

  const sender = req.user._id
  const { receiver } = req.body

  if (!receiver) {
   return res.status(400).json({ message: "Receiver required" })
  }

  /* PREVENT DUPLICATE REQUEST */

  const existing = await MatchRequest.findOne({
   $or: [
    { sender, receiver, status: "pending" },
    { sender: receiver, receiver: sender, status: "pending" }
   ]
  })

  if (existing) {
   return res.status(400).json({
    message: "Request already exists"
   })
  }

  const request = new MatchRequest({
   sender,
   receiver
  })

  await request.save()

  res.json({
   message: "Request sent successfully",
   request
  })

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})

/* ACCEPT REQUEST */

router.post("/accept", protect, async (req, res) => {

 try {

  const { requestId } = req.body

  const request = await MatchRequest.findById(requestId)

  if (!request) {
   return res.status(404).json({
    message: "Request not found"
   })
  }

  request.status = "accepted"
  request.acceptedAt = new Date()

  await request.save()

  res.json({
   message: "Request accepted",
   request
  })

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})

/* REJECT REQUEST */

router.post("/reject", protect, async (req, res) => {

 try {

  const { requestId } = req.body

  const request = await MatchRequest.findById(requestId)

  if (!request) {
   return res.status(404).json({
    message: "Request not found"
   })
  }

  request.status = "rejected"

  await request.save()

  res.json({
   message: "Request rejected"
  })

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})

/* GET RECEIVED REQUESTS */

router.get("/incoming", protect, async (req, res) => {

 try {

  const requests = await MatchRequest.find({
   receiver: req.user._id,
   status: "pending"
  }).populate("sender", "name skillsOffered skillsWanted")

  res.json(requests)

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})

/* GET ACCEPTED MATCHES */

router.get("/accepted", protect, async (req, res) => {

 try {

  const matches = await MatchRequest.find({
   $or: [
    { sender: req.user._id },
    { receiver: req.user._id }
   ],
   status: "accepted"
  }).populate("sender receiver", "name")

  res.json(matches)

 } catch (err) {

  res.status(500).json({ message: err.message })

 }

})

module.exports = router