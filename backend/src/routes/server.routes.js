const express = require('express');
const { body } = require('express-validator');
const serverController = require('../controllers/server.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Захист всіх маршрутів
router.use(protect);

// Отримання всіх серверів користувача
router.get('/', serverController.getServers);

// Отримання конкретного сервера
router.get('/:id', serverController.getServer);

// Створення нового сервера
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Назва сервера обов\'язкова'),
    body('host')
      .notEmpty()
      .withMessage('Хост сервера обов\'язковий'),
    body('port')
      .isInt({ min: 1, max: 65535 })
      .withMessage('Порт повинен бути цілим числом від 1 до 65535'),
    body('username')
      .notEmpty()
      .withMessage('Ім\'я користувача обов\'язкове')
  ],
  serverController.createServer
);

// Оновлення сервера
router.patch('/:id', serverController.updateServer);

// Видалення сервера
router.delete('/:id', serverController.deleteServer);

// Тестування підключення до сервера
router.post('/:id/test-connection', serverController.testConnection);

module.exports = router;
