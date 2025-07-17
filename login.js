const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const db = require('./db');
const session = require('express-session');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'root',
    resave: false,
    saveUninitialized: true
}));
app.get('/login', (req, res) => {
    res.render('login'); 
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            req.session.user = results[0]; 
            res.redirect('/dashboard');
        } else {
            res.send('Invalid email or password');
        }
    });
});
app.get('/dashboard', (req, res) => {
    const user = req.session.user;

    const query = 'SELECT * FROM call_stats ORDER BY id DESC LIMIT 1';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error loading stats');

        const stats = results[0];
        res.render('dashboard', { stats, user });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/login`);
});
