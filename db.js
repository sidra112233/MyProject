const express = require('express');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',       // or your MySQL password
    database: 'callcenter' // ? change to your DB name
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = db;
