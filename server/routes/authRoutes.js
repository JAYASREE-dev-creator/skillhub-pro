const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/User");

/* REGISTER */

router.post(
"/register",
upload.fields([
{ name: "aadhaarFile", maxCount: 1 },
{ name: "idCardFile", maxCount: 1 }
]),
registerUser
);

/* USER LOGIN */

router.post("/login", loginUser);

/* ADMIN LOGIN (ENV BASED) */

router.post("/admin-login",(req,res)=>{

try{

let {email,password} = req.body;

/* safety trim */

email = email?.trim();
password = password?.trim();

/* debug log */

console.log("Admin Login Attempt:",email);

if(
email === process.env.ADMIN_EMAIL &&
password === process.env.ADMIN_PASSWORD
){

console.log("Admin Login Success");

return res.json({
_id:"admin",
token:"admin-token",
role:"admin"
});

}

console.log("Admin Login Failed");

return res.status(401).json({
message:"Invalid admin credentials"
});

}catch(err){

console.error("Admin Login Error:",err);

res.status(500).json({
message:"Server error during admin login"
});

}

});

/* GET CURRENT USER */

router.get("/me", protect, async (req,res)=>{

try{

const user = await User.findById(req.user._id).select("-password");

res.json(user);

}catch(err){

res.status(500).json({message:err.message});

}

});

module.exports = router;
