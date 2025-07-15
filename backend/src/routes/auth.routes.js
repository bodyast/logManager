const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Реєстрація нового користувача
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Ім\'я користувача повинно містити мінімум 3 символи'),
    body('email')
      .isEmail()
      .withMessage('Введіть дійсну електронну адресу'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль повинен містити мінімум 6 символів')
  ],
  authController.register
);

// Авторизація користувача
router.post('/login', authController.login);

// Вихід з системи
router.post('/logout', authController.logout);

// Отримання даних поточного користувача
router.get('/me', protect, authController.getCurrentUser);

// Оновлення пароля
router.patch(
  '/update-password',
  protect,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Новий пароль повинен містити мінімум 6 символів')
  ],
  authController.updatePassword
);

module.exports = router;
