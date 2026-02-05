const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectToDatabase = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const tournamentParticipantRoutes = require('./src/routes/tournamentParticipantRoutes');
const TournamentParticipant = require('./src/models/tournamentParticipantModel');

let app = express();
let port = process.env.PORT || 5000;

app.use(cors());
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
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/tournament-participants', tournamentParticipantRoutes);

app.listen(port, () => {
    console.log('Server is running on port: ', port);
    console.log('API available at: http://localhost:' + port);
});
