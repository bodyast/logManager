const express = require('express');
const { body } = require('express-validator');
const logPathController = require('../controllers/logPath.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Захист всіх маршрутів
router.use(protect);

// Отримання всіх шляхів до логів користувача (з усіх серверів)
router.get('/', logPathController.getAllUserLogPaths);

// Отримання всіх шляхів до логів для конкретного сервера
router.get('/server/:serverId', logPathController.getLogPaths);

// Отримання конкретного шляху до логу
router.get('/:id', logPathController.getLogPath);

// Створення нового шляху до логу для конкретного сервера
router.post(
  '/server/:serverId',
  [
    body('name')
      .notEmpty()
      .withMessage('Назва логу обов\'язкова'),
    body('path')
      .notEmpty()
      .withMessage('Шлях до логу обов\'язковий')
  ],
  logPathController.createLogPath
);

// Оновлення шляху до логу
router.patch('/:id', logPathController.updateLogPath);

// Видалення шляху до логу
router.delete('/:id', logPathController.deleteLogPath);

module.exports = router;
