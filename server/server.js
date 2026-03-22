require("dotenv").config()

const express = require("express")
const cors = require("cors")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")

const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const skillRoutes = require("./routes/skillRoutes")
const sessionRoutes = require("./routes/sessionRoutes")
const adminRoutes = require("./routes/adminRoutes")
const chatRoutes = require("./routes/chatRoutes")
const recommendRoutes = require("./routes/recommendRoutes")
const matchRoutes = require("./routes/matchRoutes")

const Message = require("./models/Message")

const app = express()
const server = http.createServer(app)

/* DATABASE CONNECTION */

connectDB()

/* SOCKET SERVER */

const io = new Server(server,{
 cors:{
  origin:"*",
  methods:["GET","POST"]
 }
})

/* MIDDLEWARE */

app.use(cors())
app.use(express.json({limit:"10mb"}))
app.use(express.static(path.join(__dirname,"../client")))


/* STATIC FILES (UPLOADS) */

app.use("/uploads", express.static(path.join(__dirname,"uploads")))

/* ROUTES */

app.use("/api/auth",authRoutes)
app.use("/api/skills",skillRoutes)
app.use("/api/sessions",sessionRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/recommend",recommendRoutes)
app.use("/api/match",matchRoutes)

/* HEALTH CHECK */

app.get("/",(req,res)=>{
 res.json({
  message:"SkillHub API Running",
  status:"OK"
 })
})

/* SOCKET USER MAP */

const onlineUsers = new Map()

io.on("connection",(socket)=>{

 console.log("User Connected:",socket.id)

 /* USER JOIN */

 socket.on("join",(userId)=>{
  onlineUsers.set(userId,socket.id)
 })

 /* SEND MESSAGE */

 socket.on("sendMessage",async(data)=>{

  try{

   const {senderId,receiverId,message} = data

   const newMessage = new Message({
    sender:senderId,
    receiver:receiverId,
    text:message
   })

   await newMessage.save()

   const receiverSocket = onlineUsers.get(receiverId)

   if(receiverSocket){
    io.to(receiverSocket).emit("receiveMessage",{
     senderId,
     message,
     time:new Date()
    })
   }

  }catch(err){

   console.error("Socket Message Error:",err)

  }

 })

 /* NEW MATCH REQUEST NOTIFICATION */

 socket.on("sendMatchNotification",(data)=>{

  try{

   const {receiverId,senderName} = data

   const receiverSocket = onlineUsers.get(receiverId)

   if(receiverSocket){

    io.to(receiverSocket).emit("newMatchRequest",{
     senderName
    })

   }

  }catch(err){

   console.error("Match Notification Error:",err)

  }

 })

 /* DISCONNECT */

 socket.on("disconnect",()=>{

  console.log("User Disconnected:",socket.id)

  for(const [userId,socketId] of onlineUsers.entries()){
   if(socketId === socket.id){
    onlineUsers.delete(userId)
    break
   }
  }

 })

})

/* SERVER START */

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
 console.log("===================================")
 console.log("SkillHub Server Running")
 console.log("Port:",PORT)
 console.log("===================================")
})