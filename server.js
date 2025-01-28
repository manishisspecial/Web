const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// Set up middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up SQLite database
const db = new sqlite3.Database('yellowind.db');

// Create a table to store applications if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        cardType TEXT
    )`);
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { name, email, phone, cardType } = req.body;

    // Insert data into SQLite database
    db.run(`INSERT INTO applications (name, email, phone, cardType) VALUES (?, ?, ?, ?)`, [name, email, phone, cardType], function(err) {
        if (err) {
            return console.error(err.message);
        }
        // Redirect to confirmation page after submission
        res.redirect('/confirmation');
    });
});

// Serve the confirmation page
app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Route to fetch data from the database
app.get('/applications', (req, res) => {
  db.all("SELECT * FROM applications", [], (err, rows) => {
      if (err) {
          throw err;
      }
      res.json(rows); // Send the data as a JSON response
  });
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err);
  });
  