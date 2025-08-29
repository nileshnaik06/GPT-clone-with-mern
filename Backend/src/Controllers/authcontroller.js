const userModel = require("../model/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

async function userRegister(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUser = await userModel.findOne({
        email: email
    })

    if (isUser) {
        return res.status(401).json({
            message: "User alread exists"
        })
    }

    const hashPass = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        email: email,
        fullName: {
            firstName, lastName
        },
        password: hashPass
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.cookie("token", token);


    return res.status(201).json({
        message: "User created sucessfully",
        user: {
            fullName: user.fullName,
            email: user.email,
            _id: user._id
        }
    })

}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email
    })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.cookie("token", token)

    res.status(200).json({
        message: "user Logged in ",
        user: {
            fullName: user.fullName,
            email: user.email,
            _id: user._id
        }
    })

}

module.exports = { userRegister, loginUser }