const { verifyToken } = require('../utils/auth');
const Server = require('../models/Server');
const LogPath = require('../models/LogPath');
const { Client } = require('ssh2');

// Зберігання активних SSH підключень
const activeConnections = new Map();

// Функція для відключення SSH сесії
const closeSSHConnection = (sessionId) => {
  const connection = activeConnections.get(sessionId);
  if (connection) {
    try {
      connection.ssh.end();
      console.log(`Закрито SSH з'єднання для сесії: ${sessionId}`);
    } catch (error) {
      console.error(`Помилка закриття SSH з'єднання: ${error.message}`);
    }
    activeConnections.delete(sessionId);
  }
};

// Налаштування Socket.IO
const setupSocketIO = (io) => {
  // Middleware для аутентифікації через сокети
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Не авторизовано'));
      }
      
      try {
        // Верифікація JWT токену
        const decoded = await verifyToken(token);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Недійсний токен'));
      }
    } catch (error) {
      next(error);
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`Підключено нового клієнта з ID: ${socket.id}`);
    
    // Запуск моніторингу логу в реальному часі
    socket.on('startLogStream', async (data) => {
      try {
        const { logPathId } = data;
        
        // Унікальний ідентифікатор сесії
        const sessionId = `${socket.id}_${logPathId}`;
        
        // Знаходження шляху до логу
        const logPath = await LogPath.findById(logPathId);
        if (!logPath) {
          return socket.emit('error', { message: 'Шлях до логу не знайдено' });
        }
        
        // Знаходження сервера
        const server = await Server.findById(logPath.server_id);
        if (!server) {
          return socket.emit('error', { message: 'Сервер не знайдено' });
        }
        
        // Перевірка прав доступу
        if (server.user_id !== socket.userId) {
          return socket.emit('error', { message: 'У вас немає доступу до цього ресурсу' });
        }
        
        // Закриття існуючого підключення, якщо воно існує
        closeSSHConnection(sessionId);
        
        // Створення нового SSH підключення
        const ssh = new Client();
        
        // Підготовка параметрів підключення
        const connectConfig = {
          host: server.host,
          port: server.port,
          username: server.username
        };
        
        // Додавання методу аутентифікації
        if (server.private_key) {
          connectConfig.privateKey = server.private_key;
          
          if (server.private_key_passphrase) {
            connectConfig.passphrase = server.private_key_passphrase;
          }
        } else if (server.password) {
          connectConfig.password = server.password;
        } else {
          return socket.emit('error', { 
            message: 'Не вказано пароль або приватний ключ для підключення' 
          });
        }
        
        // Підключення до сервера і запуск моніторингу логу
        ssh.on('ready', () => {
          socket.emit('connected', { 
            message: 'Підключено до сервера',
            server: {
              id: server.id,
              name: server.name,
              host: server.host
            },
            logPath: {
              id: logPath.id,
              name: logPath.name,
              path: logPath.path
            }
          });
          
          // Команда для моніторингу логу в реальному часі
          ssh.exec(`tail -f ${logPath.path}`, (err, stream) => {
            if (err) {
              ssh.end();
              return socket.emit('error', { message: `Помилка виконання команди: ${err.message}` });
            }
            
            // Зберігання посилання на stream для можливості закриття
            activeConnections.set(sessionId, { ssh, stream });
            
            // Обробка даних з логу
            stream.on('data', (data) => {
              socket.emit('logData', { data: data.toString() });
            });
            
            // Обробка помилок
            stream.stderr.on('data', (data) => {
              socket.emit('error', { message: data.toString() });
            });
            
            // Обробка закриття потоку
            stream.on('close', () => {
              socket.emit('streamClosed', { message: 'Потік логу закрито' });
              closeSSHConnection(sessionId);
            });
          });
        }).on('error', (err) => {
          socket.emit('error', { message: `Помилка підключення: ${err.message}` });
        }).connect(connectConfig);
      } catch (error) {
        socket.emit('error', { message: `Помилка: ${error.message}` });
      }
    });
    
    // Зупинка моніторингу логу
    socket.on('stopLogStream', (data) => {
      const { logPathId } = data;
      const sessionId = `${socket.id}_${logPathId}`;
      
      closeSSHConnection(sessionId);
      socket.emit('streamStopped', { message: 'Моніторинг логу зупинено' });
    });
    
    // Обробка відключення клієнта
    socket.on('disconnect', () => {
      console.log(`Клієнт відключився: ${socket.id}`);
      
      // Закриття всіх активних підключень для цього сокета
      [...activeConnections.keys()].forEach(sessionId => {
        if (sessionId.startsWith(`${socket.id}_`)) {
          closeSSHConnection(sessionId);
        }
      });
    });
  });
};

module.exports = setupSocketIO;
