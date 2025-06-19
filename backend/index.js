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

// Import socket handler
const { handleSocketConnection } = require('./utils/socketHandler');

connectDB();

const app = express();

const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: 'Server is running',
        timestamp: new Date(),
        socketConnections: io.engine.clientsCount
    });
});

// Handle Socket.IO connections
handleSocketConnection(io);

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close();
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server ready`);
});