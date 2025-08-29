const userModel = require("../model/user.model")
const jwt = require("jsonwebtoken")


async function authValidator(req, res, next) {

    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({
            message: "Unauthorized"
        })
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        req.user = user;

        next()

    } catch (error) {
        res.status(400).json({
            message: "Unauthorized"
        })
    }
}

module.exports = {
    authValidator
}