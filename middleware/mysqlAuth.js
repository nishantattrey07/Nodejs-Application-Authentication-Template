const { initializeConnection } = require('../database/mysql');
const jwt = require("jsonwebtoken");
require('dotenv').config();

async function mysqlAuth(req,res,next) {
    const connection = await initializeConnection();
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Access Denied" });
    else { 
        const token = authHeader.split(' ')[1];
        try {
            const authenticateUser = jwt.verify(token, process.env.jwt_secret);
            const [verify] = await connection.execute(
                'SELECT * FROM users WHERE username = ?',
                [authenticateUser.username]
            );
            if (!verify) return res.status(401).json({ message: "Invalid token" });
            else {
                req.user = authenticateUser;
                next();
            }
        }
        catch (err) {
            console.log(err);
            return res.status(401).json({ message: "Invalid token" });
        }
    }
}


module.exports = mysqlAuth;