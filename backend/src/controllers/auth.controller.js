const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/auth');

// Реєстрація нового користувача
exports.register = async (req, res) => {
  try {
    // Перевірка помилок валідації
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const { username, email, password } = req.body;
    
    // Перевірка, чи не існує вже користувач з таким email або username
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Користувач з таким email вже існує'
      });
    }
    
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Користувач з таким username вже існує'
      });
    }
    
    // Створення нового користувача
    const newUser = await User.create({
      username,
      email,
      password
    });
    
    // Видалення пароля з відповіді
    newUser.password = undefined;
    
    // Генерація токену
    const token = generateToken(newUser.id);
    
    // Встановлення токену в cookie
    setTokenCookie(res, token);
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка при реєстрації: ' + error.message
    });
  }
};

// Авторизація користувача
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Перевірка наявності email і пароля
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Будь ласка, вкажіть email та пароль'
      });
    }
    
    // Пошук користувача і перевірка пароля
    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(user, password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Невірний email або пароль'
      });
    }
    
    // Видалення пароля з відповіді
    user.password = undefined;
    
    // Генерація токену
    const token = generateToken(user.id);
    
    // Встановлення токену в cookie
    setTokenCookie(res, token);
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка при авторизації: ' + error.message
    });
  }
};

// Вихід з системи
exports.logout = (req, res) => {
  // Очищення cookie з токеном
  clearTokenCookie(res);
  
  res.status(200).json({
    status: 'success',
    message: 'Вихід виконано успішно'
  });
};

// Отримання даних поточного користувача
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Користувача не знайдено'
      });
    }
    
    // Видалення пароля з відповіді
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання даних користувача: ' + error.message
    });
  }
};

// Оновлення пароля
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Перевірка наявності необхідних даних
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Будь ласка, вкажіть поточний та новий паролі'
      });
    }
    
    // Отримання поточного користувача з БД для перевірки пароля
    const user = await User.findById(req.user.id);
    
    // Перевірка поточного пароля
    if (!(await User.verifyPassword(user, currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Поточний пароль невірний'
      });
    }
    
    // Оновлення пароля
    await User.update(user.id, { password: newPassword });
    
    res.status(200).json({
      status: 'success',
      message: 'Пароль успішно оновлено'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка оновлення пароля: ' + error.message
    });
  }
};
