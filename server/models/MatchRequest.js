const mongoose = require("mongoose")

const matchRequestSchema = new mongoose.Schema({

 sender:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 receiver:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 status:{
  type:String,
  enum:["pending","accepted","rejected","cancelled"],
  default:"pending"
 },

 acceptedAt:{
  type:Date
 },

 message:{
  type:String,
  default:""
 }

},{timestamps:true})

/* PREVENT DUPLICATE REQUESTS */

matchRequestSchema.index(
 { sender:1, receiver:1 },
 { unique:true }
)

module.exports = mongoose.model("MatchRequest",matchRequestSchema)