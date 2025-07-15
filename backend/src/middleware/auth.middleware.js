const User = require('../models/User');
const { verifyToken } = require('../utils/auth');

// Middleware для захисту маршрутів, які потребують аутентифікації
exports.protect = async (req, res, next) => {
  try {
    // Отримання токену з header або з cookie
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    // Перевірка наявності токену
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Ви не авторизовані. Увійдіть у систему, щоб отримати доступ.'
      });
    }
    
    // Верифікація токену
    const decoded = await verifyToken(token);
    
    // Перевірка, чи існує користувач
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Користувач, якому належить цей токен, більше не існує.'
      });
    }
    
    // Додавання користувача до запиту
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Не авторизовано: ' + error.message
    });
  }
};

// Middleware для перевірки володіння ресурсом
exports.checkOwnership = (model, paramField) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramField];
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Ресурс не знайдено'
        });
      }
      
      // Перевірка власника ресурсу
      const ownerId = resource.user_id || resource.server_id;
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'У вас немає дозволу на доступ до цього ресурсу'
        });
      }
      
      // Додавання ресурсу до запиту
      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Помилка перевірки володіння ресурсом: ' + error.message
      });
    }
  };
};
