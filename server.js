// Import third-party modules

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const compression = require('compression');


// Create server

const app = express();


// Set server port

const PORT = process.env.PORT || 8000;


// Setup Express to serve files from public folder

app.use(express.static('public'));


// Setup Express to handle data parsing

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use(logger('dev'));


// Compress responses

app.use(compression());


// Connect to database

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/budget', {
  useNewUrlParser: true,
});


// Setup routes

app.use(require('./routes/api.js'));


// Start listener

app.listen(PORT, function() {
  console.log(`The server is listening on port ${PORT}!`);
});