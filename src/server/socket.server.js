const { Server } = require("socket.io")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const userModel = require("../model/user.model")
const messageModel = require("../model/message.model")
const { contentGenerator, generateVector } = require("../service/ai.service")
const { createMemory, queryMemory } = require("../service/vector.service")

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

        socket.on("user-prompt", async (messagePayload) => {


            const message = await messageModel.create({
                user: socket.user._id,
                chat: messagePayload.chat,
                content: messagePayload.content,
                role: "user"
            })

            const vectors = await generateVector(messagePayload.content)

            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    user: socket.user._id
                }
            })


            await createMemory({
                vectors,
                messageId: message._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })


            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat,
            }).sort({ createdAt: -1 }).limit(10).lean()).reverse()


            const response = await contentGenerator(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            }))


            const responseMessage = await messageModel.create({
                user: socket.user._id,
                chat: messagePayload.chat,
                content: response,
                role: "model"
            })

            const responsevectors = await generateVector(response)

            await createMemory({
                vectors: responsevectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            })

            socket.emit("model-resp", {
                content: response,
                chat: messagePayload.chat
            })
        })

    })
}


module.exports = socketServer