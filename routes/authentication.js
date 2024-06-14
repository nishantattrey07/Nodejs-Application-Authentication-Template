const { Router } = require("express");
const router = Router();


router.post('/signup', (req, res) => {
    res.send('Signup Route');
});

module.exports = router;