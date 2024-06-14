const { Router } = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const db_type = process.env.db_type;
const User = require('../database/mongodb');
const { initializeConnection } = require('../database/mysql');
const router = Router();


// Creating Schema for User inputs to verify the data.
const userSchema = zod.object({
    name: zod.string().min(3),
    username: zod.string().min(3),
    email: zod.string().email(),
    password: zod.string().min(6)
});
function validateUser(name, username, email, password) {
    const result = userSchema.safeParse({ name, username, email, password });
    if (!result.success) console.log(result.error);
    return result.success;
}

async function mongodb(name, username, email, password, res) {
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
            // No existing user found, proceed to create a new user
            const newUser = new User({ name, username, email, password });
            await newUser.save();
            const token = jwt.sign({ username: username, email: email }, process.env.jwt_secret);
            return res.status(201).json({
                message: 'User created successfully',
                token: token
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function mysql(name, username, email, password, res) {
    const connection = await initializeConnection();
    try {
        // Check if user exists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Insert new user
        await connection.execute(
            'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, password]
        );

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        await connection.end();
    }
}

// Signup Section- Change the Parameters accordingly
router.post('/signup', (req, res) => {
    const { name, username, email, password } = req.body;
    if (validateUser(name, username, email, password)) { 
        if (db_type === 'mongodb') { 
            const result=mongodb(name,username,email,password,res)
        }
        if (db_type === 'mysql') {
            mysql(name, username, email, password, res);
        }
    }
    else {
        res.send('Invalid User Data');
    }

});

module.exports = router;