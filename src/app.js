const express = require("express")
const userRoute = require("../src/routes/auth.route")
const chatRoute = require("../src/routes/chat.route")
const cookieParser = require("cookie-parser")
const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', userRoute)
app.use('/api/chat', chatRoute)
module.exports = app