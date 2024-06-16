const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { initializeConnection } = require('../database/mysql');

// Signup Section- Change the Parameters accordingly
async function mysqlSignup(name, username, email, password, res) {
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


// signin section for mysql database

async function mysqlSignin(username, password, res) {
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

module.exports = {
    mysqlSignup,
    mysqlSignin
}