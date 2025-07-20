const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const db = require('./db');
const session = require('express-session');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
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
app.get('/inbound/calls', (req, res) => {
    const selectedCustomer = req.query.customer;

    let sql = 'SELECT * FROM inbound_calls';
    const values = [];

    if (selectedCustomer) {
        sql += ' WHERE customer_name = ?';
        values.push(selectedCustomer);
    }

    db.query(sql, values, (err, results) => {
        if (err) throw err;

        db.query('SELECT DISTINCT customer_name FROM inbound_calls', (err2, customers) => {
            if (err2) throw err2;

            res.render('inbound/calls', {
                calls: results,
                customers,
                selectedCustomer: req.query.customer || ''
            });
        });
    });
});

app.get('/customers/list', (req, res) => {
    const query = `SELECT * FROM lists`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).send('Server Error');
        }
        res.render('customers/list', { calls: results });
    });
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/login`);
});
