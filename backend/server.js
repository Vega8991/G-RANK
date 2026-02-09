let express = require('express');
let cors = require('cors');
require('dotenv').config();

let connectToDatabase = require('./src/config/database');
let authRoutes = require('./src/routes/authRoutes');
let tournamentRoutes = require('./src/routes/tournamentRoutes');
let tournamentParticipantRoutes = require('./src/routes/tournamentParticipantRoutes');
let matchResultRoutes = require('./src/routes/matchResultRoutes');

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
app.use('/api/match-results', matchResultRoutes);

app.listen(port, () => {
    console.log('Server is running on port: ', port);
    console.log('API available at: http://localhost:' + port);
});
