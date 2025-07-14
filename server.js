const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
// Create connection
const connection = mysql.createConnection({
    host: 'localhost',       // or your remote host
    user: 'root',            // your MySQL username
    password: '',            // your MySQL password
    database: 'callcenter' // your database name
});
// Connect
connection.connect((err) => {
    if (err) {
        console.error('MySQL connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as ID ' + connection.threadId);
});

module.exports = connection;
// Serve HTML file
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/about', (req, res) => {
    res.render('about'); // about.ejs
});
app.get('/ecommerce', (req, res) => {
    res.render('ecommerce'); // ecommerce.ejs
});

app.get('/government', (req, res) => {
    res.render('government'); // government.ejs
});

app.get('/realestate', (req, res) => {
    res.render('realestate'); // realestate.ejs
});
app.get('/medical', (req, res) => {
    res.render('medical'); // medical.ejs
});

app.get('/fastfood', (req, res) => {
    res.render('fastfood'); // fastfood.ejs
});

app.get('/travel', (req, res) => {
    res.render('travel'); // travel.ejs
});

app.get('/facility', (req, res) => {
    res.render('facility'); // facility.ejs
});
app.get('/services', (req, res) => {
    res.render('services'); // services.ejs
});

app.get('/why', (req, res) => {
    res.render('why'); // why.ejs
});
app.get('/inbound', (req, res) => {
    res.render('inbound'); // inbound.ejs
});
app.get('/digital', (req, res) => {
    res.render('digital'); // digital.ejs
});

app.get('/contact', (req, res) => {
    res.render('contact'); // contact.ejs
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
