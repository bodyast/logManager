const express = require('express');
const logController = require('../controllers/log.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Захист всіх маршрутів
router.use(protect);

// Отримання вмісту лог-файлу
router.get('/:logPathId', logController.getLogContent);

// Перевірка доступності лог-файлу
router.get('/:logPathId/check', logController.checkLogFile);

module.exports = router;
