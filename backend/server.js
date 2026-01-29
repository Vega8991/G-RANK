let express = require('express');
let cors = require('cors');
require('dotenv').config();

let connectionToDatabase = require('./src/config/database');
let authRoutes = require('./src/routes/authRoutes');
const connectToDatabase = require('./src/config/database');

let app = express();
let port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
connectToDatabase();

app.get('/', (req, res)=> {
    res.json({
        message: 'G-Rank API is running',
        version: '1.0.0',
        status: 'active'
    });
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log('Server is running on port: ', port);
    console.log('API available at: http://localhost:' + port);
});