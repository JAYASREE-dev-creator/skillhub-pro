const express = require("express")
const router = express.Router()

const User = require("../models/User")
const { protect } = require("../middleware/authMiddleware")

/* FIND BEST MATCHES */

router.get("/matches", protect, async (req,res)=>{

try{

const currentUser = await User.findById(req.user._id)

const users = await User.find({
_id:{ $ne:req.user._id },
verificationStatus:"verified"
})

/* PRELOAD ALL USERS FOR RARITY CALCULATION */

const allUsers = await User.find()

const skillCount={}

allUsers.forEach(user=>{
user.skillsOffered.forEach(skill=>{
skillCount[skill]=(skillCount[skill]||0)+1
})
})

let matches=[]

for(const u of users){

let mutual = 0
let oneWay = 0
let interest = 0
let rarityBonus = 0

/* MUTUAL MATCH */

currentUser.skillsWanted.forEach(skill=>{

if(
u.skillsOffered.includes(skill) &&
u.skillsWanted.some(s=>currentUser.skillsOffered.includes(s))
){
mutual++
}

})

/* ONE WAY */

currentUser.skillsWanted.forEach(skill=>{
if(u.skillsOffered.includes(skill)){
oneWay++
}
})

/* SHARED INTEREST */

currentUser.skillsOffered.forEach(skill=>{
if(u.skillsOffered.includes(skill)){
interest++
}
})

/* RARITY BONUS */

currentUser.skillsWanted.forEach(skill=>{
if(u.skillsOffered.includes(skill)){
rarityBonus += 1 / (skillCount[skill] || 1)
}
})

const score =
(mutual * 10) +
(oneWay * 6) +
(interest * 2) +
rarityBonus

if(score>0){

matches.push({

_id:u._id,
name:u.name,
skillsOffered:u.skillsOffered,
skillsWanted:u.skillsWanted,
score:Math.round(score*10)/10

})

}

}

/* SORT BY SCORE */

matches.sort((a,b)=>b.score-a.score)

/* RETURN TOP 3 */

res.json(matches.slice(0,3))

}catch(err){

console.error("Match error:",err)

res.status(500).json({
message:"Match calculation failed"
})

}

})

module.exports = router