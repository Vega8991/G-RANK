let mongoose = require('mongoose');
require('dotoenv').config();

let mongoConnectionString = process.env.MONGO_URI;

function connectToDatabase() {
    mongoose.connect(mongoConnectionString);

    let databaseConnection = mongoose.connection;

    databaseConnection.on('error', (err) => {
        console.log('Error connecting to MongoDB', err);
    });

    databaseConnection.once('open', () => {
        console.log('Connected to MongoDB successfully!');
    });
}

module.exports = connectToDatabase;