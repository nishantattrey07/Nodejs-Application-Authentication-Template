const { Router } = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const db_type = process.env.db_type;
const User = require('../database/mongodb');
const { initializeConnection } = require('../database/mysql');
const mongodbAuth = require("../middleware/mongodbAuth");
const mysqlAuth = require("../middleware/mysqlAuth");
const { validateUser } = require("../routes/validation");
const { mongodbSignup, mongodbSignin } = require("../routes/mongodbAuth");
const { mysqlSignup, mysqlSignin } = require("../routes/mysqlAuth");
const {mongodbVerify,mysqldbVerify}=require("../routes/accountVerification")
const router = Router();



// Signup Section- Change the Parameters accordingly
router.post('/signup', (req, res) => {
    const { name, username, email, password } = req.body;
    if (validateUser(name, username, email, password)) { 
        console.log(db_type);
        if (db_type === 'mongodb') { 
            const result=mongodbSignup(name,username,email,password,res)
        }
        if (db_type === 'mysql') {
            mysqlSignup(name, username, email, password, res);
        }
    }
    else {
        res.send('Invalid User Data');
    }

});

router.post('/signin', (req, res) => { 
    const { username, password } = req.body;
    if (db_type === 'mongodb') {
        mongodbSignin(username,password,res);
    }
    else if (db_type === 'mysql') {
        mysqlSignin(username,password,res);
    }
})


router.get('/verify-email', (req, res) => {
    if (db_type === 'mongodb') {
        mongodbVerify(req, res);
    }
    else if (db_type === 'mysql') {
        mysqldbVerify(req, res);
    }
})




module.exports = router;