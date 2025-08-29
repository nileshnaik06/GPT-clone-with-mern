const express = require("express")
const chatController = require("../Controllers/chatController")
const userValidator = require("../middlewares/auth.middleware")
const route = express.Router()


route.post('/', userValidator.authValidator, chatController.createChat)
route.get('/', userValidator.authValidator, chatController.fetchChats)

module.exports = route