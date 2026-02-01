require('dotenv').config();
let { sendVerificationEmail } = require('./src/services/emailService').default;

console.log('Testing G-Rank Email Service...');

sendVerificationEmail(
  'maanuveega04@gmail.com',
  'VegaTest',
  'test_token_123456'
);

console.log('Email enviado! Revisa tu bandeja de entrada.');
