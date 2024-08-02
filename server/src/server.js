// server/server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

const db = mysql.createConnection({
    host: 'your-db-host',
    user: 'your-db-user',
    password: 'your-db-password',
    database: 'your-db-name'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/api/accidents', (req, res) => {
    const sql = 'SELECT * FROM accidents'; // Adjust this query as per your table structure
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

