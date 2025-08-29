const express = require("express")
const authUser = require("../Controllers/authcontroller")
const route = express.Router()

route.post('/register', authUser.userRegister)
route.post('/login', authUser.loginUser)

module.exports = route