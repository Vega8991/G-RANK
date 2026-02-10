let mongoose = require('mongoose');
require('dotenv').config();

let mongoConnectionString = process.env.MONGO_URI;

function connectToDatabase() {
    mongoose.connect(mongoConnectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log('Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB:', err.message);
    });
}

module.exports = connectToDatabase;