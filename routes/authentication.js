const { Router } = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
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
            // Hash the password before saving the new user
            const hashedPassword = await argon2.hash(password);
            // proceed to create a new user
            const newUser = new User({ name, username, email, password:hashedPassword });
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

        // Hash the password before saving the new user
        const hashedPassword = await argon2.hash(password);

        // Insert new user
        await connection.execute(
            'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, hashedPassword]
        );
        const token = jwt.sign({ username: username, email: email }, process.env.jwt_secret);
        return res.status(201).json({
            message: 'User created successfully',
            token: token
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        await connection.end();
    }
}


// signin section for mongodb database
async function mongodbCheckUser(username, password, res) {
    try {
        const user =await  User.findOne({ username: username });
        if (user) {
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


// signin section for mysql database

async function mysqlCheckUser(username,password,res) {
    const connection = await initializeConnection();
    try {
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        if (await argon2.verify(user.password, password)) {
            const token = jwt.sign({ username: username, email: user.email }, process.env.jwt_secret);
            return res.status(200).json({ message: 'User signed in', token: token });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
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
        console.log(db_type);
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

router.post('/signin', (req, res) => { 
    const { username, password } = req.body;
    if (db_type === 'mongodb') {
        mongodbCheckUser(username,password,res);
    }
    else if (db_type === 'mysql') {
        mysqlCheckUser(username,password,res);
    }
})

module.exports = router;