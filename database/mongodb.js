const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.mongodb)

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
module.exports = User;  //exporting the User model to be used in other files.