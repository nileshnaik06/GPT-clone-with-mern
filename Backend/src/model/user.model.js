const mongoose = require("mongoose")

const userShema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    fullName: {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        }
    },
    password: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userShema)

module.exports = userModel
