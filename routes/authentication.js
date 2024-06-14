const { Router } = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const db_type = process.env.db_type;
const User = require('../database/mongodb');
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

async function mongodb(name, username, email, password,res) {
    try {
        const existingUser = await User.findOne({ username: username, email: email });
        const existingEmail = await User.findOne({ email: email });
        const existingUsername = await User.findOne({ username: username });
        if (!existingUser) {
            if (existingUsername) {
                return res.status(409).json({
                    message: `The username is already taken`,
                    username: existingUsername.username
                })
            }
            else if (existingEmail) {
                return res.status(409).json({
                    message: `The email is already taken`
                });
            }
            else {
                const newUser = new User({ name, username, email, password })
                await newUser.save();
                const token = jwt.sign({ username: username, email: email }, process.env.jwt_secret);
                return res.status(201).json({
                    message: 'User created successfully',
                    token: token
                });
            }

        }
        else { 
            return res.status(409).json({
                message: `The user already exists`,
                username: existingUser.username
            });
        }
        

    }
    catch (err) {
        console.log(err);
    }
}


// Signup Section- Change the Parameters accordingly
router.post('/signup', (req, res) => {
    const { name, username, email, password } = req.body;
    if (validateUser(name, username, email, password)) { 
        if (db_type === 'mongodb') { 
            const result=mongodb(name,username,email,password,res)
        }
    }
    else {
        res.send('Invalid User Data');
    }

});

router.get('/test', (req, res) => {
    // console.log(validateUser("name", "username", "email@gmail.com", "password"));
    console.log(db_type);
    res.send('Test Done, See console');
})

module.exports = router;