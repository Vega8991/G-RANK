const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectToDatabase = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const lobbyRoutes = require('./src/routes/lobbyRoutes');
const lobbyParticipantRoutes = require('./src/routes/lobbyParticipantRoutes');
const matchResultRoutes = require('./src/routes/matchResultRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const riotRoutes = require('./src/routes/riotRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);

const ALLOWED_ORIGINS = [
    process.env.CLIENT_URL,
    'https://grank.vega8991.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
].filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow VS Code / Azure dev tunnels only in development
        if (isDev && origin.endsWith('.devtunnels.ms')) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

connectToDatabase();

app.get('/', (req, res) => {
    res.json({
        message: 'G-Rank API is running',
        version: '1.0.0',
        status: 'active'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/lobby-participants', lobbyParticipantRoutes);
app.use('/api/match-results', matchResultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/riot', riotRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    console.error('[GlobalErrorHandler]', err.stack || err.message || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
