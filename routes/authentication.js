const { Router } = require('express');
const zod = require('zod');
const db_type = process.env.db_type;
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
// Signup Section- Change the Parameters accordingly 
router.post('/signup', (req, res) => {
    const { name, username, email, password } = req.body;
    if (validateUser(name, username, email, password)) { 
        if (db_type === 'mongodb') { 
            
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