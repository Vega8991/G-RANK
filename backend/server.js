let express = require('express');
let cors = require('cors');
require('dotenv').config();

let connectToDatabase = require('./src/config/database');
let authRoutes = require('./src/routes/authRoutes');
let tournamentRoutes = require('./src/routes/tournamentRoutes');

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

app.listen(port, () => {
    console.log('Server is running on port: ', port);
    console.log('API available at: http://localhost:' + port);
});
