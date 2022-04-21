'use strict'

const express = require('express');
const cors = require('cors');
const app = express();
const winston = require('winston');
const expressWinston = require('express-winston');

const db = require('./app/models');
db.sequelize.sync();

global.__basedir = __dirname;

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

// middlwware for logging
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: false,
  msg: "HTTP  ",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false;
  }
}));

// simple route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Student Management application.'
  });
});

require('./app/routes/students.routes.js')(app);

// error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message
  });
})

// set port, listen for requests
const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});