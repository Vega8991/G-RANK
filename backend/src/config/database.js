const mongoose = require('mongoose');
require('dotenv').config();

const mongoConnectionString = process.env.MONGO_URI;

function connectToDatabase() {
    if (!mongoConnectionString) {
        console.error('[Database] MONGO_URI is not defined. Check your .env file.');
        process.exit(1);
    }

    mongoose.connect(mongoConnectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('[Database] Connected to MongoDB successfully.');
    })
    .catch((err) => {
        console.error('[Database] Connection failed:', err.message);
        process.exit(1);
    });
}

module.exports = connectToDatabase;
