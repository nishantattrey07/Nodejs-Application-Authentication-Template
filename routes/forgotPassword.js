const jwt = require('jsonwebtoken');
const User = require('../database/mongodb');
const { initializeConnection } = require('../database/mysql');
const { sendResetPasswordEmail } = require('../routes/mailer');


function generateResetToken(user) {
    if (user._id) {
        return jwt.sign({ _id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
    }
    return jwt.sign({ _id: user.id }, process.env.jwt_secret, { expiresIn: '1h' });
    
}
async function mongodbForgotPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const resetToken = generateResetToken(user);
        await sendResetPasswordEmail(user.name, user.email, resetToken);
        return res.status(200).json({ message: 'Password reset link sent to your email' });


    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

async function mysqldbForgotPassword(req, res) { 
    const { email } = req.body;
    const connection = await initializeConnection();
    try {
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        const resetToken = generateResetToken(user);
        await sendResetPasswordEmail(user.name, user.email, resetToken);
        return res.status(200).json({ message: 'Password reset link sent to your email' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        await connection.end();
    }
}


module.exports = {
    mongodbForgotPassword,
    mysqldbForgotPassword
};