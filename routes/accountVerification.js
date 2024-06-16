const User = require('../database/mongodb');



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

module.exports = {
    mongodbVerify
}