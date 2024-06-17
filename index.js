const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
require('dotenv').config();
const authenticateRouter = require("./routes/authentication");
const app = express()
app.use(bodyparser.json());
app.use(cors());
app.use('/api/auth', authenticateRouter);
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Nodejs Application Template listening on port ${port}!`))