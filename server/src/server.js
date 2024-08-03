const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

const db = mysql.createConnection({
    host: 'database-1.ctai20qooer2.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'team32monash',
    database: 'my_database'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.get('/api/accidents', (req, res) => {
    const sql = 'SELECT LATITUDE, LONGITUDE, SEVERITY FROM VICTORIAN_ROAD_CRASH_DATA_2YR_CBD_URBAN';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
