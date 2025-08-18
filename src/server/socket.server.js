const { Server } = require("socket.io")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const userModel = require("../model/user.model")
const messageModel = require("../model/message.model")
const contentGenerator = require("../service/ai.service")

function socketServer(httpServer) {
    const io = new Server(httpServer, {})

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")


        if (!cookies.token) {
            next(new Error("Authenticaton error: no token provided"))
        }

        try {
            const decoded = await jwt.verify(cookies.token, process.env.JWT_SECRET)

            const user = userModel.findById(decoded.id)

            socket.user = user
            next()

        } catch (error) {
            next(new Error("Authenticaton error: no token provided"))
        }

    })

    io.on('connection', (socket) => {
        console.log('a user connected')

        socket.on("user-prompt", async (messagePlayload) => {
            await messageModel.create({
                user: socket.user._id,
                chat: messagePlayload.chat,
                content: messagePlayload.content,
                role: "user"
            })

            const chatHistory = (await messageModel.find({
                chat: messagePlayload.chat,
            }).sort({ createdAt: -1 }).limit(10).lean()).reverse()


            const response = await contentGenerator(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            }))

            await messageModel.create({
                user: socket.user._id,
                chat: messagePlayload.chat,
                content: response,
                role: "model"
            })

            socket.emit("model-resp", {
                content: response,
                chat: messagePlayload.chat
            })
        })

    })
}


module.exports = socketServer