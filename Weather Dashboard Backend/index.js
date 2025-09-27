const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // allow frontend to connect
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // your DB username
  password: '',           // your DB password
  database: 'ds18b20_projet_v1'   // your DB name
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('✅ Connected to MySQL!');
});

// ✅ Endpoint to get latest sensor readings
app.get('/sensorReadings', (req, res) => {
    console.log("hitt")
  const sql = `SELECT temperature, humidity, pressure, temperature_locale, state
               FROM readings
               ORDER BY id DESC LIMIT 1`;

 db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No sensor data found' });
    }

    const latest = results[0];

    // Ensure all required fields are present
    const response = {
      temperature: latest.temperature || 0,
      humidity: latest.humidity || 0,
      pressure: latest.pressure || 0,
      temperature_locale : latest.temperature_locale || 0,
      state:latest.state || 0
    };

    res.json(response); // Respond with valid data
  });
});

function generateRandomSensorData() {
  const temperature = (Math.random() * 30 + 15).toFixed(2);  // Random temperature between 15 and 45
  const humidity = (Math.random() * 100).toFixed(2);  // Random humidity between 0 and 100
  const pressure = (Math.random() * 200 + 900).toFixed(2);  // Random pressure between 900 and 1100 hPa
  const altitude = (Math.random() * 25 + 34).toFixed(2);  // Random altitude between 50m and 200m

  const states = ['INIT', 'REINIT', 'ENDTREATMENT', 'TREATMENT', 'HEATING'];

  // Randomly select a state
  const state = states[Math.floor(Math.random() * states.length)];
  return {
    temperature,
    humidity,
    pressure,
    altitude,
    state
  };
}

// ✅ Function to save the generated random data into the database
function saveRandomDataToDatabase() {
  const sensorData = generateRandomSensorData();

  // Delete all previous data
  const deleteSql = `DELETE FROM readings`;

  db.query(deleteSql, (err) => {
    if (err) {
      console.error('Error deleting old data:', err);
      return;
    }
  })

    // Now insert the new data
    const insertSql = `
      INSERT INTO readings (temperature, humidity, pressure, temperature_locale, state) 
      VALUES (?, ?, ?, ?,?)
    `;

    db.query(insertSql, [
      sensorData.temperature,
      sensorData.humidity,
      sensorData.pressure,
      sensorData.altitude,
      sensorData.state
    ], (err) => {
      if (err) {
        console.error('Error inserting data into database:', err);
        return;
      }

      // console.log('Random data saved:', sensorData);
    });
  
}

setInterval(saveRandomDataToDatabase, 1000);



// ✅ Endpoint to get all sensor readings by time range (for current date)
app.get('/sensorReadingsByTime', (req, res) => {
  console.log("hit for get time slot data")
  const { startTime, endTime ,  parameter} = req.query;

  // Validate required parameters
  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Both startTime and endTime are required' });
  }

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Construct the datetime strings by combining current date with time
  const startDateTime = `${currentDate} ${startTime}`;
  const endDateTime = `${currentDate} ${endTime}`;

  console.log(startDateTime, endDateTime)

  // Validate time format (HH:MM:SS)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!timeRegex.test(startTime)) {
    return res.status(400).json({ error: 'startTime must be in HH:MM:SS format' });
  }
  if (!timeRegex.test(endTime)) {
    return res.status(400).json({ error: 'endTime must be in HH:MM:SS format' });
  }

  const sql = `
    SELECT *
    FROM readings
    WHERE time BETWEEN ? AND ?
     AND state = ? 
    ORDER BY time ASC
  `;

  db.query(sql, [startDateTime, endDateTime, parameter], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No sensor data found for the specified time range' });
    }

    // Format the response with all sensor data
    const response = results.map(row => ({
      time: row.time,
      temperature: row.temperature,
      localTemperature: row.temperature_locale,
      pressure: row.pressure,
      humidity: row.humidity,
      state: row.state
    }));

    res.json(response);
    console.log(response)
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
