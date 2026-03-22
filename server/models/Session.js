const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({

 userA:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  index:true
 },

 userB:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
  index:true
 },

 date:{
  type:Date,
  required:true
 },

 /* SESSION STATUS */

 status:{
  type:String,
  enum:["scheduled","completed","cancelled"],
  default:"scheduled"
 },

 /* OPTIONAL SESSION NOTES */

 notes:{
  type:String,
  default:""
 },

 /* SESSION RATING (FOR FUTURE IMPROVEMENT) */

 rating:{
  type:Number,
  min:1,
  max:5
 }

},{timestamps:true})

/* FAST QUERY FOR USER SESSION HISTORY */

sessionSchema.index({ userA:1, userB:1, date:-1 })

module.exports = mongoose.model("Session",sessionSchema)