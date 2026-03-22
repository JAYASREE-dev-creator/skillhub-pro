const mongoose = require("mongoose")

const connectDB = async () => {

try {

console.log("Connecting to MongoDB...")

await mongoose.connect(process.env.MONGO_URI)

console.log("===================================")
console.log("MongoDB Connected Successfully")
console.log("Database:", mongoose.connection.name)
console.log("Host:", mongoose.connection.host)
console.log("===================================")

} catch (error) {

console.error("===================================")
console.error("MongoDB Connection Failed")
console.error("Error:", error.message)
console.error("===================================")

process.exit(1)

}

}

module.exports = connectDB
