const { validationResult } = require('express-validator');
const Server = require('../models/Server');

// Отримання всіх серверів користувача
exports.getServers = async (req, res) => {
  try {
    const servers = await Server.findByUserId(req.user.id);
    
    // Видалення конфіденційних даних з відповіді
    const safeServers = servers.map(server => {
      const { password, private_key, private_key_passphrase, ...safeServer } = server;
      return safeServer;
    });
    
    res.status(200).json({
      status: 'success',
      results: safeServers.length,
      data: {
        servers: safeServers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання серверів: ' + error.message
    });
  }
};

// Отримання конкретного сервера
exports.getServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    // Перевірка, чи є користувач власником сервера
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Видалення конфіденційних даних з відповіді
    const { password, private_key, private_key_passphrase, ...safeServer } = server;
    
    res.status(200).json({
      status: 'success',
      data: {
        server: safeServer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка отримання сервера: ' + error.message
    });
  }
};

// Створення нового сервера
exports.createServer = async (req, res) => {
  try {
    // Перевірка помилок валідації
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    // Додавання ID користувача до даних сервера
    const serverData = {
      ...req.body,
      user_id: req.user.id
    };
    
    // Створення нового сервера
    const newServer = await Server.create(serverData);
    
    // Видалення конфіденційних даних з відповіді
    const { password, private_key, private_key_passphrase, ...safeServer } = newServer;
    
    res.status(201).json({
      status: 'success',
      data: {
        server: safeServer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка створення сервера: ' + error.message
    });
  }
};

// Оновлення сервера
exports.updateServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    // Перевірка, чи є користувач власником сервера
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Оновлення сервера
    const updatedServer = await Server.update(req.params.id, req.body);
    
    // Видалення конфіденційних даних з відповіді
    const { password, private_key, private_key_passphrase, ...safeServer } = updatedServer;
    
    res.status(200).json({
      status: 'success',
      data: {
        server: safeServer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка оновлення сервера: ' + error.message
    });
  }
};

// Видалення сервера
exports.deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    // Перевірка, чи є користувач власником сервера
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Видалення сервера
    await Server.delete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Помилка видалення сервера: ' + error.message
    });
  }
};

// Перевірка з'єднання з сервером
exports.testConnection = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Сервер не знайдено'
      });
    }
    
    // Перевірка, чи є користувач власником сервера
    if (server.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас немає доступу до цього сервера'
      });
    }
    
    // Імпорт SSH клієнту тут для економії ресурсів
    const { Client } = require('ssh2');
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
      return res.status(400).json({
        status: 'error',
        message: 'Не вказано пароль або приватний ключ для підключення'
      });
    }
    
    // Спроба підключення
    try {
      await new Promise((resolve, reject) => {
        ssh.on('ready', () => {
          ssh.end();
          resolve();
        }).on('error', (err) => {
          reject(err);
        }).connect(connectConfig);
      });
      
      res.status(200).json({
        status: 'success',
        message: "З'єднання успішно встановлено"
      });
    } catch (sshError) {
      res.status(400).json({
        status: 'error',
        message: `Помилка з'єднання: ${sshError.message}`
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: "Помилка тестування з'єднання: " + error.message
    });
  }
};
