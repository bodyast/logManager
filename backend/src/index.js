require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Маршрути
const authRoutes = require('./routes/auth.routes');
const serverRoutes = require('./routes/server.routes');
const logPathRoutes = require('./routes/logPath.routes');
const logRoutes = require('./routes/log.routes');

// Сокет-менеджер
const setupSocketIO = require('./sockets');

// Ініціалізація додатку
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'http://localhost:3000'
      : 'http://localhost:3000',
    credentials: true
  }
});

// Налаштування middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'http://localhost:3000'
    : 'http://localhost:3000',
  credentials: true
}));

// Підключення маршрутів
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/log-paths', logPathRoutes);
app.use('/api/logs', logRoutes);

// Базовий маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Ласкаво просимо до API Log Manager!' });
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Щось пішло не так!'
  });
});

// Налаштування сокетів
setupSocketIO(io);

// Запуск сервера
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});

module.exports = { app, server };
