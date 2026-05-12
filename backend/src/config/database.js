const mongoose = require('mongoose');
require('dotenv').config();

const mongoConnectionString = process.env.MONGO_URI;

function connectToDatabase() {
    if (!mongoConnectionString) {
        process.exit(1);
    }

    mongoose.connect(mongoConnectionString, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .catch(() => {
        process.exit(1);
    });
}

module.exports = connectToDatabase;
