let mongoose = require('mongoose');
require('dotenv').config();

let mongoConnectionString = process.env.MONGO_URI;

function connectToDatabase() {
    if (!mongoConnectionString) {
        console.error('MONGO_URI is not defined in environment variables');
        process.exit(1);
    }

    mongoose.connect(mongoConnectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });
}

module.exports = connectToDatabase;