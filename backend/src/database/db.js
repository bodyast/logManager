const knex = require('knex');
const knexConfig = require('../../knexfile');

// Вибір конфігурації в залежності від оточення
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Ініціалізація підключення до бази даних
const db = knex(config);

module.exports = db;
