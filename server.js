require("dotenv").config()
const app = require("./src/app")
const connectDb = require("./src/db/db")
const socketServer = require("./src/server/socket.server")
const httpServer = require("http").createServer(app)

connectDb()
socketServer(httpServer)

httpServer.listen(3000, () => {
    console.log('server is running on port 3000')
})