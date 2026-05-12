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

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

app.listen(port);
