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
// Middleware to inject user in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user; // or req.user
    next();
});

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
app.get('/inbound/calls', (req, res) => {
    const query = `SELECT 
      id, 
      customer_name AS customer, 
      agent_name AS agent, 
      caller_name AS caller, 
      phone_number AS number, 
      call_type AS type, 
      language, 
      created_at AS date,
      duration 
    FROM inbound-calls 
    ORDER BY created_at DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});
app.get('/customers/list', (req, res) => {
    const { industry, search, start_date, end_date } = req.query;

    let query = `
        SELECT company_name, industry, did_number,
               DATE_FORMAT(added_on, '%d %b, %Y') as added_on
        FROM list WHERE 1=1`;
    let params = [];

    if (industry) {
        query += ` AND industry = ?`;
        params.push(industry);
    }
    if (search) {
        query += ` AND company_name LIKE ?`;
        params.push(`%${search}%`);
    }
    if (start_date) {
        query += ` AND added_on >= ?`;
        params.push(start_date);
    }
    if (end_date) {
        const endDatePlusOne = new Date(end_date);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        const formattedEndDate = endDatePlusOne.toISOString().split('T')[0];
        query += ` AND added_on < ?`;
        params.push(formattedEndDate);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error');
        }
        // Render EJS template instead of sending raw JSON
        res.render('customers/list', { customers: results, user: req.session.user });
    });
});


app.get('/chats/dashboard', async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
      SELECT 
        platform,
        COUNT(*) as count 
      FROM chatsdashboard
      WHERE status = 'pending'
      GROUP BY platform
    `);

        const platforms = {
            Facebook: 0,
            Instagram: 0,
            Whatsapp: 0,
            WBWhatsapp: 0,
            WebChats: 0,
            Outlook: 0,
            Gmail: 0,
        };

        rows.forEach(row => {
            platforms[row.platform] = row.count;
        });

        res.render('chats/dashboard', {
            platforms,
            user:req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load chat data');
    }
});
app.post('/webhook', express.json(), (req, res) => {
    const data = req.body;

    if (data.entry) {
        data.entry.forEach(entry => {
            const changes = entry.changes;
            changes.forEach(change => {
                const messageData = change.value?.messages?.[0];
                if (messageData) {
                    // Save to DB (you can push it to memory or DB for dashboard)
                    console.log("New message from WhatsApp:", messageData.text.body);
                }
            });
        });
    }

    res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/login`);
});
