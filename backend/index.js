const express = require('express');
const connectDB = require('./db/connection');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/index');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv').config();
const hpp = require('hpp');

connectDB();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

app.use('/', routes)

app.get('/', (req, res) => {
    res.json({message: "I am the app"});
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})