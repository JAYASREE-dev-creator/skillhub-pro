const API = window.location.origin
let token=localStorage.getItem("token") || ""
let currentUserId=localStorage.getItem("userId") || ""
let isAdmin=localStorage.getItem("isAdmin")==="true"

if(token==="admin-token"){
localStorage.clear()
token=""
isAdmin=false
}

let currentChatUser=null
let selectedSessionUser = null
let matchesVisible = false
let sessionsVisible = false



function showPage(page){

const pages=[
"registerPage",
"loginPage",
"adminPage",
"userDashboard",
"adminDashboard"
]

pages.forEach(p=>{
const el=document.getElementById(p)
if(el){
el.classList.add("hidden")
}
})

const target=document.getElementById(page)

if(target){
target.classList.remove("hidden")
}

}

/* REGISTER */

async function register(){

try{

const formData=new FormData()

formData.append("name",rname.value)
formData.append("email",remail.value)
formData.append("password",rpassword.value)
formData.append("skillsOffered",skillsOffered.value)
formData.append("skillsWanted",skillsWanted.value)

if(aadhaar.files[0]) formData.append("aadhaarFile",aadhaar.files[0])
if(idcard.files[0]) formData.append("idCardFile",idcard.files[0])

const res=await fetch(API+"/api/auth/register",{method:"POST",body:formData})

const data=await res.json()

if(res.ok){

alert("Registration successful. Wait for admin verification.")

/* CLEAR FORM FIELDS */

rname.value=""
remail.value=""
rpassword.value=""
skillsOffered.value=""
skillsWanted.value=""
aadhaar.value=""
idcard.value=""

showPage("loginPage")

}
else{
alert(data.message)
}

}catch(err){
alert("Registration failed")
}

}


/* USER LOGIN */

async function login(){

try{

const email=lemail.value
const password=lpassword.value

const res=await fetch(API+"/api/auth/login",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({email,password})
})

const data=await res.json()

if(data.token){

token=data.token
currentUserId=data._id

localStorage.setItem("token",token)
localStorage.setItem("userId",currentUserId)
localStorage.setItem("isAdmin","false")

showPage("userDashboard")

loadProfile()
loadChatUsers()
loadScheduleUsers()
loadIncomingRequests()
loadSessionStats()

}else{
alert(data.message)
}

}catch(err){
alert("Login failed")
}

}


/* ADMIN LOGIN */

async function adminLogin(){

try{

const email=adminEmail.value
const password=adminPassword.value

const res=await fetch(API+"/api/auth/admin-login",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({email,password})
})

const data=await res.json()

if(data.role==="admin"){

token=data.token
localStorage.setItem("token",token)
localStorage.setItem("isAdmin","true")
isAdmin = true

alert("Admin login successful")

showPage("adminDashboard")

}else{
alert(data.message)
}

}catch(err){
console.log(err) 
alert("Admin login failed")
}

}

/* LOAD ADMIN DASHBOARD */

async function loadAdminDashboard(){

try{

const container = document.getElementById("pendingUsers")

if(!container) return

container.innerHTML="<h2 style='color:black'>Loading pending users...</h2>"
const res = await fetch(API+"/api/admin/pending?nocache="+Date.now(),{
headers:{
Authorization:"Bearer "+token
}
})

const users = await res.json()

container.innerHTML=""

if(!users || users.length===0){
container.innerHTML="<h3>No pending users</h3>"
return
}

users.forEach(u=>{

const div=document.createElement("div")

div.className="admin-user"
div.innerText=u.name

div.onclick=()=>viewUser(u._id)

container.appendChild(div)

})

}catch(err){

console.log("Admin dashboard error")

}

}

/* LOAD ADMIN STATS */

async function loadAdminStats(){

try{

const container = document.getElementById("adminStats")

if(!container) return

container.innerHTML="Loading stats..."

const res = await fetch(API+"/api/admin/stats",{
headers:{ Authorization:"Bearer "+token }
})

const data = await res.json()

container.innerHTML = `
<p><b>Total Users:</b> ${data.totalUsers}</p>
<p><b>Verified Users:</b> ${data.verifiedUsers}</p>
<p><b>Pending Users:</b> ${data.pendingUsers}</p>
`

}catch(err){

console.log("Admin stats error",err)

}

}



/* VIEW USER DETAILS */

async function viewUser(id){

try{

const res = await fetch(API+"/api/admin/user/"+id,{
headers:{ Authorization:"Bearer "+token }
})

const user = await res.json()

const detail=document.getElementById("adminUserDetail")

detail.innerHTML=`

<h3>${user.name}</h3>

<p><b>Email:</b> ${user.email}</p>

<p><b>Skills Offered:</b> ${user.skillsOffered.join(", ")}</p>

<p><b>Skills Wanted:</b> ${user.skillsWanted.join(", ")}</p>

<h4>Aadhaar</h4>
<a href="${user.aadhaarFile}" target="_blank">
<img src="${user.aadhaarFile}" width="200">
</a>

<h4>ID Card</h4>
<a href="${user.idCardFile}" target="_blank">
<img src="${user.idCardFile}" width="200">
</a>

<br><br>

<button onclick="verifyUser('${user._id}')">✔ Verify</button>
<button onclick="deleteUser('${user._id}')">✖ Reject</button>

`

}catch(err){

alert("Failed to load user details")

}

}



/* VERIFY USER */

async function verifyUser(id){

try{

const res = await fetch(API+"/api/admin/verify/"+id,{
method:"PUT",
headers:{ Authorization:"Bearer "+token }
})

const data = await res.json()

alert(data.message || "User verified")

/* RELOAD PENDING USERS */

loadAdminDashboard()

/* RELOAD ADMIN STATS */

loadAdminStats()

/* CLEAR USER DETAIL PANEL */

const detail=document.getElementById("adminUserDetail")
if(detail){
detail.innerHTML=""
}

}catch(err){

alert("Verification failed")

}

}





/* DELETE USER */

async function deleteUser(id){

try{

const res = await fetch(API+"/api/admin/delete/"+id,{
method:"DELETE",
headers:{ Authorization:"Bearer "+token }
})

const data = await res.json()

alert(data.message || "User removed")

loadAdminDashboard()

}catch(err){

alert("Delete failed")

}

}


/* LOAD PROFILE */

async function loadProfile(){

try{

const res=await fetch(API+"/api/auth/me",{
headers:{ Authorization:"Bearer "+token }
})

const user=await res.json()

welcomeUser.innerText="Welcome "+user.name

}catch(err){
console.log("Profile error")
}

}


/* FIND MATCHES */

async function getMatches(){

const box=document.getElementById("matches")

/* TOGGLE HIDE */

if(matchesVisible){
box.innerHTML=""
matchesVisible=false
return
}

box.innerHTML="Finding best matches..."

try{

const res=await fetch(API+"/api/match/find",{
headers:{ Authorization:"Bearer "+token }
})

const data=await res.json()

box.innerHTML=""

if(!data || data.length===0){
box.innerHTML="No matches found"
matchesVisible=true
return
}

data.forEach(m=>{

const div=document.createElement("div")

div.style.border="1px solid #ddd"
div.style.padding="12px"
div.style.borderRadius="8px"
div.style.marginBottom="12px"

const offerTags=(m.skillsOffered || []).map(s=>`<span class="skill-tag">${s}</span>`).join(" ")
const wantTags=(m.skillsWanted || []).map(s=>`<span class="skill-tag">${s}</span>`).join(" ")

div.innerHTML=`
<b>${m.name}</b><br>
Score: <b>${m.score}</b><br><br>

<b>Skills They Offer:</b><br>
${offerTags}<br><br>

<b>Skills They Want:</b><br>
${wantTags}<br><br>

<button onclick="sendMatchRequest('${m.id}')">Request</button>
`

box.appendChild(div)

})

matchesVisible=true

}catch(err){
box.innerHTML="Failed to load matches"
}

}



/* SEND MATCH REQUEST */

async function sendMatchRequest(receiverId){

try{

const res=await fetch(API+"/api/match/request",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({receiver:receiverId})
})

const data=await res.json()

alert(data.message)

}catch(err){
alert("Request failed")
}

}


/* LOAD INCOMING REQUESTS */

async function loadIncomingRequests(){

const box=document.getElementById("incomingRequests")
if(!box) return

box.innerHTML="Loading requests..."

try{

const res=await fetch(API+"/api/match/incoming",{
headers:{ Authorization:"Bearer "+token }
})

const requests=await res.json()

box.innerHTML=""

if(!requests || requests.length===0){
box.innerHTML="No pending requests"
return
}

requests.forEach(r=>{

const div=document.createElement("div")

div.style.border="1px solid #ddd"
div.style.padding="10px"
div.style.borderRadius="6px"
div.style.marginBottom="10px"

div.innerHTML=`
<b>${r.sender.name}</b><br>
Skills Offered: ${(r.sender.skillsOffered || []).join(", ")}<br>
Skills Wanted: ${(r.sender.skillsWanted || []).join(", ")}<br>

<button onclick="acceptRequest('${r._id}')">Accept</button>
<button onclick="rejectRequest('${r._id}')">Reject</button>
`

box.appendChild(div)

})

}catch(err){
box.innerHTML="Failed to load requests"
}

}


/* ACCEPT REQUEST */

async function acceptRequest(requestId){

try{

const res=await fetch(API+"/api/match/accept",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({requestId})
})

const data=await res.json()

alert(data.message)

loadIncomingRequests()
loadChatUsers()

}catch(err){
alert("Accept failed")
}

}


/* REJECT REQUEST */

async function rejectRequest(requestId){

try{

const res=await fetch(API+"/api/match/reject",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({requestId})
})

const data=await res.json()

alert(data.message)

loadIncomingRequests()

}catch(err){
alert("Reject failed")
}

}


/* LOAD SESSIONS */

async function loadSessions(){

const list=document.getElementById("sessionList")

/* TOGGLE HIDE */

if(sessionsVisible){
list.innerHTML=""
sessionsVisible=false
return
}

try{

const res=await fetch(API+"/api/sessions/user/"+currentUserId,{
headers:{ Authorization:"Bearer "+token }
})

const sessions=await res.json()

list.innerHTML=""

sessions.forEach(s=>{

const div=document.createElement("div")

let actionButton=""

/* SHOW BUTTON ONLY IF SESSION IS SCHEDULED */

if(s.status==="scheduled"){

actionButton = `
<button onclick="markSessionCompleted('${s._id}')" 
style="margin-top:6px;padding:4px 10px;font-size:12px">
Mark Completed
</button>
`

}
/* SHOW COMPLETED TEXT */

else if(s.status==="completed"){

actionButton = `
<span style="color:green;font-weight:600">
✔ Session Completed
</span>
`

}

div.innerHTML=`
${s.userA.name} ↔ ${s.userB.name}<br>
Date: ${new Date(s.date).toLocaleString()}<br>
Status: ${s.status}<br>
<button onclick="markSessionCompleted('${s._id}')" style="margin-top:6px;padding:4px 10px;font-size:12px">
Mark Completed
</button>
<hr>
`

list.appendChild(div)

})

sessionsVisible=true

}catch(err){
console.log("Session load error")
}

}

/* MARK SESSION COMPLETED */

async function markSessionCompleted(sessionId){

try{

const res = await fetch(API+"/api/sessions/complete",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({sessionId})
})

const data = await res.json()

alert(data.message)

loadSessions()
loadSessionStats()

}catch(err){
alert("Failed to complete session")
}

}

/*LOAD SESSION STATS*/

async function loadSessionStats(){

try{

const res = await fetch(API+"/api/sessions/stats/"+currentUserId,{
headers:{ Authorization:"Bearer "+token }
})

const data = await res.json()

document.getElementById("completedSessions").innerText = data.completedSessions

const badge = document.getElementById("badgeLevel")

const completed = data.completedSessions

if(completed >= 10){

badge.innerText = "🏆 Master Mentor"
badge.style.background = "#16a34a"
badge.style.color = "white"

}
else if(completed >= 5){

badge.innerText = "⭐⭐⭐ Rising Star"
badge.style.background = "#7c3aed"
badge.style.color = "white"

}
else if(completed >= 3){

badge.innerText = "⭐⭐ Active Learner"
badge.style.background = "#2563eb"
badge.style.color = "white"

}
else{

badge.innerText = "⭐ Beginner"
badge.style.background = "#ebc075"
badge.style.color = "white"

}

/* TOTAL SESSIONS */

const totalRes = await fetch(API+"/api/sessions/user/"+currentUserId,{
headers:{ Authorization:"Bearer "+token }
})

const sessions = await totalRes.json()

document.getElementById("totalSessions").innerText = sessions.length

}catch(err){
console.log("Stats error",err)
}

}

/*LOAD SCHEDULE USERS */
async function loadScheduleUsers(){

try{

const res = await fetch(API+"/api/match/accepted",{
headers:{ Authorization:"Bearer "+token }
})

const users = await res.json()

const container = document.getElementById("scheduleUsers")

if(!container) return

container.innerHTML=""

if(!users || users.length===0){
container.innerHTML="No accepted users"
return
}

users.forEach(u=>{

const other = u.sender._id === currentUserId ? u.receiver : u.sender

const btn=document.createElement("button")

btn.innerText=other.name
btn.style.margin="5px"
btn.style.padding="6px 12px"
btn.style.width="auto"
btn.style.fontSize="13px"

btn.className="schedule-user-btn"
btn.onclick=()=>selectSessionUser(other._id,other.name,btn)

container.appendChild(btn)

})

}catch(err){
console.log("Schedule users error")
}

}

/*selectSessionUser*/

function selectSessionUser(userId,userName,button){

selectedSessionUser=userId

const panel=document.getElementById("schedulePanel")

if(panel){
panel.classList.remove("hidden")
}

/* remove highlight from all buttons */

document.querySelectorAll(".schedule-user-btn").forEach(btn=>{
btn.style.background="#2563eb"
})

/* highlight selected button */

button.style.background="#16a34a"

}

/*CONFIRM SCHEDULE*/

async function confirmSchedule(){

const date=document.getElementById("sessionDate").value

if(!selectedSessionUser || !date){
alert("Select user and date")
return
}

try{

const res = await fetch(API+"/api/sessions/schedule",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({
userB:selectedSessionUser,
date:date
})
})

const data = await res.json()

alert(data.message || "Session scheduled")

document.getElementById("sessionDate").value=""

loadSessions()

}catch(err){

alert("Scheduling failed")

}

}


/* CHAT USERS */

async function loadChatUsers(){

try{

const res=await fetch(API+"/api/match/accepted",{
headers:{ Authorization:"Bearer "+token }
})

const users=await res.json()

const dropdown=document.getElementById("chatUser")

dropdown.innerHTML="<option value=''>Select User</option>"

users.forEach(u=>{

const other = u.sender._id === currentUserId ? u.receiver : u.sender

const opt=document.createElement("option")
opt.value=other._id
opt.textContent=other.name

dropdown.appendChild(opt)

})

}catch(err){
console.log("Chat user error")
}

}


/* LOAD CHAT HISTORY */

/* LOAD CHAT HISTORY */

async function loadChatHistory(userId){

const box=document.getElementById("chatBox")

box.innerHTML="Loading..."

try{

const res = await fetch(API+`/api/chat/history/${userId}`,{
headers:{ Authorization:"Bearer "+token }
})

if(!res.ok){
box.innerHTML="Failed to load chat"
return
}

const messages = await res.json()

box.innerHTML=""

messages.forEach(m=>{

const div=document.createElement("div")

const time=new Date(m.createdAt).toLocaleTimeString()

if(m.sender === currentUserId){

div.style.textAlign="right"
div.innerHTML=`
<span style="background:#DCF8C6;padding:6px;border-radius:6px;display:inline-block">
You: ${m.text}<br>
<small>${time}</small>
</span>
`

}else{

div.style.textAlign="left"
div.innerHTML=`
<span style="background:#eee;padding:6px;border-radius:6px;display:inline-block">
${m.text}<br>
<small>${time}</small>
</span>
`

}

box.appendChild(div)

})

box.scrollTop=box.scrollHeight

}catch(err){

box.innerHTML="Failed to load chat"

}

}

/* SEND MESSAGE */

async function sendMessage(){

const userId = chatUser.value
const message = chatMessage.value.trim()

if(!userId || !message){
 alert("Select user and type message")
 return
}

try{

const res = await fetch(API+"/api/chat/send",{
 method:"POST",
 headers:{
  "Content-Type":"application/json",
  Authorization:"Bearer "+token
 },
 body:JSON.stringify({
  receiverId:userId,
  message:message
 })
})

if(!res.ok){
 alert("Message failed")
 return
}

chatMessage.value=""

loadChatHistory(userId)

}catch(err){
 alert("Message failed")
}

}


/* LOAD CHAT WHEN USER SELECTED */

const chatUserElement = document.getElementById("chatUser");

if(chatUserElement){

chatUserElement.addEventListener("change",function(){

const userId=this.value;

if(userId){
loadChatHistory(userId);
}

});

}


/* LOGOUT */

function logout(){

localStorage.clear()
window.location.href="logout.html"

}


/* AUTO LOGIN */

/* AUTO LOGIN */

document.addEventListener("DOMContentLoaded", function(){

const splash = document.getElementById("splash")

setTimeout(()=>{

if(splash){
splash.style.opacity="0"
setTimeout(()=> splash.style.display="none",500)
}

/* AUTO LOGIN */

if(token && isAdmin){

showPage("adminDashboard")
loadAdminDashboard()

}
else if(token){

currentUserId = localStorage.getItem("userId")

showPage("userDashboard")
loadProfile()
loadChatUsers()
loadScheduleUsers()
loadIncomingRequests()
loadSessionStats()

}
else{

showPage("registerPage")

}

},1800)

})
