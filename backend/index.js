const express = require('express');
const connectDB = require('./db/connection');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/index');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv').config();
const hpp = require('hpp');
const http = require('http');
const socketIO = require('socket.io');
const socketMiddleware = require('./middleware/socketMiddleware');

connectDB();

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);

const io = socketIO(server);

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

// socket middleware
app.use(socketMiddleware(io));

app.use('/', routes)

app.get('/', (req, res) => {
    res.json({message: "I am the app"});
})

// socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user Connected');

    // when user sends a message
    socket.on('sendMessage', (data) => {
        const { conversationId, message } = data;
        io.to(conversationId).emit('receiveMessage', message);
    });

    // join in a conversation room for private messaging
    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User join conversation ${conversationId}`);
    });

    // when a user disconnects
    socket.on('disconnect', () => {
        console.log('A user disconneted!!');
    });
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})