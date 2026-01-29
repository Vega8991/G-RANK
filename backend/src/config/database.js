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
        console.log('\nPor favor verifica:');
        console.log('1. Tu IP está en la lista blanca de MongoDB Atlas');
        console.log('2. Tu usuario y contraseña son correctos');
        console.log('3. Tu conexión a internet funciona correctamente');
    });
}

module.exports = connectToDatabase;