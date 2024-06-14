const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeConnection() {
    const connection = await mysql.createConnection({
        host: process.env.mysql_host,
        user: process.env.mysql_username,
        password: process.env.mysql_password,
        database: process.env.mysql_database
    });
    return connection;
}

module.exports = { initializeConnection };