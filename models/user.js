var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    role: {
        type: String
    }
},
{ timestamps: true }
);

module.exports = User = mongoose.model("user", userSchema);