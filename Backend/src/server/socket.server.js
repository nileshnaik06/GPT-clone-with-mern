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


            const [message, vectors] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: messagePayload.content,
                    role: "user"
                }),
                generateVector(messagePayload.content)
            ])


            await createMemory({
                vectors,
                messageId: message._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        user: socket.user._id
                    }
                }),
                (await messageModel.find({
                    chat: messagePayload.chat,
                }).sort({ createdAt: -1 }).limit(10).lean()).reverse()
            ])

            const [stm, ltm] = await Promise.all([
                chatHistory.map(item => {
                    return {
                        role: item.role,
                        parts: [{ text: item.content }]
                    }
                }),
                [{
                    role: 'user',
                    parts: [{
                        text: `
                    these are the previous chat's use them to generate a response
                    ${memory.matches.map((item) => item.metadata.text).join("\n")}
                    ` }]
                }]
            ])

            const response = await contentGenerator([...ltm, ...stm])


            socket.emit("model-resp", {
                content: response,
                chat: messagePayload.chat
            })


            const [responseMessage, responsevectors] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: response,
                    role: "model"
                }),
                generateVector(response)
            ])

            await createMemory({
                vectors: responsevectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            })


        })

    })
}


module.exports = socketServer