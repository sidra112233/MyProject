const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//  connection
const connection = mysql.createConnection({
    host: 'localhost',       
    user: 'root',           
    password: '',            
    database: 'callcenter' 
});
// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('MySQL connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as ID ' + connection.threadId);
});

module.exports = connection;
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/about', (req, res) => {
    res.render('about'); 
});
app.get('/ecommerce', (req, res) => {
    res.render('ecommerce'); 
});

app.get('/government', (req, res) => {
    res.render('government');
});

app.get('/realestate', (req, res) => {
    res.render('realestate'); 
});
app.get('/medical', (req, res) => {
    res.render('medical'); 
});

app.get('/fastfood', (req, res) => {
    res.render('fastfood'); 
});

app.get('/travel', (req, res) => {
    res.render('travel'); 
});

app.get('/facility', (req, res) => {
    res.render('facility'); 
});
app.get('/services', (req, res) => {
    res.render('services'); 
});

app.get('/why', (req, res) => {
    res.render('why'); 
});
app.get('/inbound', (req, res) => {
    res.render('inbound'); 
});
app.get('/digital', (req, res) => {
    res.render('digital'); 
});

app.get('/contact', (req, res) => {
    res.render('contact');
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
