const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../database/mongodb');

// Remember the token should be in Authorization section of Header like
async function mongodbAuth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });
    else {
        // To separate token from first word Bearer
        const token = authHeader.split(' ')[1];
        try {
            const authenticateUser = jwt.verify(token, process.env.jwt_secret);
            const verify = User.findOne({ username: authenticateUser.username });
            if (!verify) return res.status(401).json({ message: "Invalid token" });
            else {
                console.log(authenticateUser);
                req.user = authenticateUser;
                next();
            }
        }
        catch (err) {
            console.log(err);
            return res.status(401).json({ message: "Invalid token" });
        }
    }
};

module.exports = mongodbAuth;