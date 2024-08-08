const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

// Database connection configuration
const dbConfig = {
    host: 'database-1.ctai20qooer2.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'team32monash',
    database: 'my_database',
};

// Create a MySQL connection
let db;

function handleDisconnect() {
    db = mysql.createConnection(dbConfig); // Recreate the connection

    db.connect(err => {
        if (err) {
            console.log('Error when connecting to MySQL:', err);
            setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
        } else {
            console.log('MySQL Connected...');
        }
    });

    db.on('error', err => {
        console.log('MySQL error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Reconnect if the connection is lost
        } else {
            throw err;
        }
    });
}

handleDisconnect(); // Initial connection

// Periodic ping to keep the connection alive
setInterval(() => {
    db.query('SELECT 1', (err, results) => {
        if (err) {
            console.log('Ping query error:', err);
        } else {
            console.log('Ping query successful:', results);
        }
    });
}, 60000); // Ping every 60 seconds

// Route for fetching accident data
app.get('/api/accidents', (req, res) => {
    const sql = 'SELECT LATITUDE, LONGITUDE, SEVERITY FROM accident_location';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Server error');
        } else {
            res.send(results);
        }
    });
});

// Route for fetching filtered accident data
app.get('/api/accidents/filtered', (req, res) => {
    const { year, timezone } = req.query;
    const sql = `
        SELECT 
            ACCIDENT_YEAR, TIME_ZONE, 
            SUM(mild_accidents) AS mild, 
            SUM(severe_accidents) AS severe, 
            SUM(fatal_accidents) AS fatal 
        FROM acc_sub_severity 
        WHERE ACCIDENT_YEAR = ? AND TIME_ZONE = ?
        GROUP BY ACCIDENT_YEAR, TIME_ZONE
    `;
    db.query(sql, [year, timezone], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Server error');
        } else {
            res.send(results);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Useful commands
// Check server running on port 5000
// lsof -i :5000

// Kill that process
// kill -9 PID

// Run the server
// node src/server.js
