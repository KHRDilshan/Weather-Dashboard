const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3002;

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



// ✅ Endpoint to get all sensor readings by time range (for current date)
app.get('/VideoStreamSensorReadingsByDateTime', (req, res) => {

  const { startTime, endTime } = req.query;
  console.log("hit for get time slot data", startTime, endTime )
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
    FROM sensordata
    WHERE reading_time BETWEEN ? AND ?
    ORDER BY reading_time ASC
  `;

  db.query(sql, [startDateTime, endDateTime], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No sensor data found for the specified time range' });
    }

    // Format the response with all sensor data
    const response = results.map(row => ({
      reading_time: row.reading_time,
      temperature: row.value1,
      humidity: row.value2,
      pressure: row.value3,
      altitude: row.value4,
      co2: row.value5,
      pm25: row.value6,
      pm10: row.value7,
    }));

    res.json(response);
    console.log(response)
  });
});








function generateRandomSensorDataForVideoStream() {
  const value1 = (Math.random() * 30 + 15).toFixed(2);   // Temperature 15-45°C
  const value2 = (Math.random() * 100).toFixed(2);       // Humidity 0-100%
  const value3 = (Math.random() * 200 + 900).toFixed(2); // Pressure 900-1100 hPa
  const value4 = (Math.random() * 25 + 34).toFixed(2);   // Altitude 34-59 m

  const value5 = (Math.random() * 1600 + 400).toFixed(2); // CO2 400-2000 ppm
  const value6 = (Math.random() * 150).toFixed(2);        // PM2.5 0-150 µg/m³
  const value7 = (Math.random() * 200).toFixed(2);        // PM10 0-200 µg/m³

  return {
    value1,
    value2,
    value3,
    value4,
    value5,
    value6,
    value7
  };
}

function saveRandomSensorDataToDatabase() {
  const sensorData = generateRandomSensorDataForVideoStream();

  // Delete all previous data
  // const deleteSql = `DELETE FROM sensordata`;

  // db.query(deleteSql, (err) => {
  //   if (err) {
  //     console.error('Error deleting old data:', err);
  //     return;
  //   }

    // Now insert the new data
    const insertSql = `
      INSERT INTO sensordata 
      (value1, value2, value3, value4, value5, value6, value7, location, sensor) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [
      sensorData.value1,
      sensorData.value2,
      sensorData.value3,
      sensorData.value4,
      sensorData.value5,
      sensorData.value6,
      sensorData.value7,
      "Box Lovely N°01 - Ecuries ODV-LAB", // location
      "SDS011-BME680"                      // sensor
    ], (err) => {
      if (err) {
        console.error('Error inserting data into database:', err);
        return;
      }

      // console.log('Random sensor data saved:', sensorData);
    });

}

// Save new random data every second
setInterval(saveRandomSensorDataToDatabase, 1000);


app.get('/sensorDataReadingsVideoStream', (req, res) => {
    console.log("hitt sensor data")
  const sql = `SELECT value1, value2, value3, value4, value5, value6, value7, location
               FROM sensordata
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
      temperature: latest.value1 || 0,
      humidity: latest.value2 || 0,
      pressure: latest.value3 || 0,
      altitude: latest.value4 || 0,
      co2: latest.value5 || 0,
      pm25: latest.value6 || 0,
      pm10: latest.value7 || 0,
      location: latest.location || ''
    };

    res.json(response); // Respond with valid data
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
