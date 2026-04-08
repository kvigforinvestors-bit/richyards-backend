const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));

// CORS configuration - IMPROVED
const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://richyardsinvestors.com",
    "https://www.richyardsinvestors.com",
    "https://richyards-frontend.pages.dev",
    "https://richyards-frontend.kvigforinvestors.workers.dev",
    "https://portol.netlify.app",
    "https://richyards-admin.netlify.app"
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(null, true); // Temporarily allow all for testing
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Database connection
const { initDB, query } = require('./db');

// Initialize database
initDB();

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/lead', require('./routes/lead'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Richyards Investors API is running!',
        timestamp: new Date(),
        endpoints: ['/api/contact', '/api/lead', '/api/chat', '/api/posts', '/api/auth', '/api/dashboard']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log('Richyards Backend running on port ' + PORT);
    console.log('API Test: http://localhost:' + PORT + '/api/test');
});
