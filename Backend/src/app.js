const express = require("express")
const userRoute = require("../src/routes/auth.route")
const chatRoute = require("../src/routes/chat.route")
const Cors = require('cors')
const cookieParser = require("cookie-parser")
const app = express()


app.use(express.json())
app.use(cookieParser())
app.use(Cors({
    origin: "http://localhost:5173",
    // methods: ["GET", "POST", "PUT", "DELETE"], // optionally allow specific methods
    credentials: true,
    // optionsSuccessStatus: 200
}))

app.use('/api/auth', userRoute)
app.use('/api/chat', chatRoute)
module.exports = app