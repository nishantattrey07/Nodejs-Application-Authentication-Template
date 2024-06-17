const jwt = require('jsonwebtoken');
const User = require('../database/mongodb');
const { sendResetPasswordEmail } = require('../routes/mailer');

function generateResetToken(user) {
    return jwt.sign({ _id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
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


module.exports = { mongodbForgotPassword };