const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const db = require('./db'); // ? Your MySQL connection module
const session = require('express-session');
const app = express();

// ? Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// ? Set views directory and EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ? Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Session middleware
app.use(session({
    secret: 'root', // change this in production
    resave: false,
    saveUninitialized: true
}));
// ? GET: Login form
app.get('/login', (req, res) => {
    res.render('login'); // Renders views/login.ejs
});

// ? POST: Login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            req.session.user = results[0]; // ?? save user to session
            // Successful login
            res.redirect('/dashboard');
        } else {
            // Invalid login
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
        res.render('dashboard', { stats, user }); // ?? pass user
    });
});


// ? Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/login`);
});
