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
//`accident_location`
//VICTORIAN_ROAD_CRASH_DATA_2YR_CBD_URBAN

app.get('/api/accidents', (req, res) => {
    const sql = 'SELECT LATITUDE, LONGITUDE, SEVERITY FROM accident_location'; //for the route page, we are using accident_location
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get('/api/accidents/filtered', (req, res) => { //for bar chart
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
        if (err) throw err;
        res.send(results);
    });
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//useful command 
// check sever running in port 5000 
// lsof -i :5000

//kill that process 
//kill -9 PID

//run the sever 
//server % node src/server.js