const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../database/mongodb');
require('dotenv').config();

async function mongodbResetPassword(req, res) { 
    const { oldPassword,newPassword,email } = req.body;
    const token = req.query.token;
    if (!token && (!oldPassword || !email)) {
        return res.status(400).json({ message: 'Incomplete Credentials' });
    }
    if (oldPassword && newPassword) { 
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: 'Old password and new password cannot be the same' });
        }
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!await argon2.verify(user.password, oldPassword)) {
                return res.status(401).json({ message: 'Incorrect password' });
            } else { 
                const hashedPassword = await argon2.hash(newPassword);
                user.password = hashedPassword;
                await user.save();
                return res.json({ message: 'Password has been reset' });
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    try {
        const verifyToken = jwt.verify(token, process.env.jwt_secret);
        console.log(verifyToken);
        const user = await  User.findById(verifyToken._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await argon2.hash(newPassword)
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password has been reset' });
    }
    catch (err) { 
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    mongodbResetPassword
}