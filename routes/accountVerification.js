const User = require('../database/mongodb');
const { initializeConnection } = require('../database/mysql');



async function mongodbVerify(req, res) {
    const token = req.query.token;
    try {
        const verifyUser = await User.findOne({ verificationToken: token });
        if (verifyUser) {
            verifyUser.isVerified = true;
            verifyUser.verificationToken = null;

            await verifyUser.save();
            res.send('Account verified successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function mysqldbVerify(req, res) { 
    const token = req.query.token;
    const connection = await initializeConnection();
    try {
        const [verifyUser] = await connection.execute('SELECT * FROM users WHERE verificationToken=?', [token]);
        if (verifyUser) {
            await connection.execute('UPDATE users SET isVerified = 1, verificationToken = NULL WHERE verificationToken = ?', [token]);
            res.send('Account verified successfully');
        }
        
    }
    catch (err) { 
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
        
}

module.exports = {
    mongodbVerify,
    mysqldbVerify
}