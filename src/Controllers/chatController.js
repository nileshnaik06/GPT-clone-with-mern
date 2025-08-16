const chatModel = require("../model/chat.model")

async function createChat(req, res) {
    const { title } = req.body;

    const user = req.user

    const chat = await chatModel.create({
        user: user._id,
        title: title
    });

    res.status(200).json({
        message: "Chat created sucessfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }
    });
}

module.exports = { createChat }