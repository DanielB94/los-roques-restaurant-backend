require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const { initializeSocket, io } = require('../config/socketConfig');
const Order = require('../models/ordersModel');

const app = express();

const mongoDB = process.env.MONGODB_KEY;
mongoose.connect(mongoDB)
.then((result) => {
    app.listen(3100); console.log('listening');
    initializeSocket();
})
.catch(err => console.log(err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
