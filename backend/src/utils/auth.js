const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Генерація JWT токену
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Перевірка та верифікація JWT токену
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Недійсний або прострочений токен');
  }
};

// Встановлення JWT токену в HTTP-only cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN.match(/\d+/)[0] * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('jwt', token, cookieOptions);
};

// Видалення JWT токену з cookie
const clearTokenCookie = (res) => {
  res.cookie('jwt', 'logged_out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
};

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie
};
