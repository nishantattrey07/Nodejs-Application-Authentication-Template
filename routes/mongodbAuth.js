const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const crypto = require('crypto');
const User = require('../database/mongodb');
const { sendVerificationEmail } = require('../routes/mailer');
const { log } = require('console');



async function mongodbSignup(name, username, email, password, res) {
    try {
        // Check for existing user by username or email in a single query
        const existingUser = await User.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            // Determine the specific conflict based on what matched
            const conflictMessage = existingUser.username === username ?
                `The username is already taken` : `The email is already taken`;

            return res.status(409).json({
                message: conflictMessage,
                username: existingUser.username
            });
        } else {
            // Generate a random verification token
            const verificationToken = crypto.randomBytes(64).toString('hex');
            // Hash the password before saving the new user
            const hashedPassword = await argon2.hash(password);
            // proceed to create a new user
            const newUser = new User({ name, username, email, password: hashedPassword,verificationToken:verificationToken,isVerified:false });
            await newUser.save();
            const token = jwt.sign({ username: username, email: email }, process.env.jwt_secret, { expiresIn: '7d' });
            sendVerificationEmail(name,email, verificationToken);
            return res.status(201).json({
                message: 'Registration successful! Please check your email to verify your account.',
                token: token
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



// signin section for mongodb database
async function mongodbSignin(username, password, res) {
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            if (argon2.verify(user.password, password)) {
                const token = jwt.sign({ username: username, email: user.email }, process.env.jwt_secret);
                return res.status(200).json({ message: 'User signed in', token: token });
            }
            else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

module.exports = {
    mongodbSignup,
    mongodbSignin
}