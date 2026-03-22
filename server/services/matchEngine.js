function normalizeSkills(skills){
 if(!Array.isArray(skills)) return []
 return skills.map(s => s.toLowerCase().trim())
}

/* CALCULATE RARITY WEIGHTS */

function calculateSkillFrequency(users){

 const freq = {}

 users.forEach(user => {

  const offered = normalizeSkills(user.skillsOffered)

  offered.forEach(skill => {

   if(!freq[skill]){
    freq[skill] = 0
   }

   freq[skill]++

  })

 })

 return freq

}

/* CALCULATE MATCH SCORE */

function calculateScore(userA,userB,skillFreq){

 let score = 0

 const offerA = normalizeSkills(userA.skillsOffered)
 const wantA  = normalizeSkills(userA.skillsWanted)

 const offerB = normalizeSkills(userB.skillsOffered)
 const wantB  = normalizeSkills(userB.skillsWanted)

 /* MUTUAL MATCH */

 const mutualTeach = offerA.filter(skill => wantB.includes(skill))
 const mutualLearn = offerB.filter(skill => wantA.includes(skill))

 const mutualCount = Math.min(mutualTeach.length, mutualLearn.length)

 if(mutualCount > 0){
  score += mutualCount * 50
 }

 /* ONE WAY MATCH */

 const oneWay = offerB.filter(skill =>
  wantA.includes(skill) && !mutualLearn.includes(skill)
 )

 score += oneWay.length * 20

 /* SHARED INTEREST */

 const sharedInterest = offerA.filter(skill => offerB.includes(skill))

 score += sharedInterest.length * 5

 /* RARITY BONUS */

 let rarityBonus = 0

 mutualLearn.forEach(skill => {

  const freq = skillFreq[skill] || 1

  rarityBonus += (1 / freq) * 15

 })

 score += rarityBonus

 /* PERFECT MATCH BONUS */

 if(mutualTeach.length > 1 && mutualLearn.length > 1){
  score += 25
 }

 return {
  score: Math.round(score),
  mutualTeach,
  mutualLearn
 }

}

/* FIND TOP MATCHES */

function findTopMatches(currentUser,users){

 const matches=[]

 const skillFreq = calculateSkillFrequency(users)

 users.forEach(user=>{

  if(!user || !user._id) return

  if(user._id.equals(currentUser._id)) return

  const {score,mutualTeach,mutualLearn} =
   calculateScore(currentUser,user,skillFreq)

  if(score <= 0) return

  matches.push({

   id:user._id,
   name:user.name,
   skillsOffered:user.skillsOffered || [],
   skillsWanted:user.skillsWanted || [],

   mutualTeach,
   mutualLearn,

   score

  })

 })

 /* SORT BY BEST MATCH */

 matches.sort((a,b)=>b.score-a.score)

 /* RETURN TOP 3 */

 return matches.slice(0,3)

}

module.exports = {
 findTopMatches
}