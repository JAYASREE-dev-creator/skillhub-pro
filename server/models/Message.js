const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({

 sender:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  index:true
 },

 receiver:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  index:true
 },

 text:{
  type:String,
  required:true,
  trim:true,
  maxlength:2000
 },

 /* LINK MESSAGE TO MATCH REQUEST (CHAT UNLOCK RULE) */

 request:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"MatchRequest",
  default:null
 },

 /* MESSAGE DELIVERY STATUS */

 status:{
  type:String,
  enum:["sent","delivered","read"],
  default:"sent"
 },

 /* ADMIN MODERATION FLAG */

 flagged:{
  type:Boolean,
  default:false
 },

 /* OPTIONAL FILE ATTACHMENT */

 attachment:{
  type:String,
  default:""
 }

},{timestamps:true})

/* FAST QUERY INDEX FOR CONVERSATIONS */

messageSchema.index({ sender:1, receiver:1, createdAt:-1 })

module.exports = mongoose.model("Message",messageSchema)